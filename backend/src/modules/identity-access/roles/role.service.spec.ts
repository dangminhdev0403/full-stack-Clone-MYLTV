import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import type { PrismaService } from '../../../prisma/prisma.service';
import type { AuditService } from '../audit/audit.service';
import { RoleService } from './role.service';

describe('RoleService', () => {
  let service: RoleService;
  let mockPrisma: any;
  let mockAuditService: { record: jest.Mock };

  beforeEach(() => {
    mockAuditService = {
      record: jest.fn().mockResolvedValue(undefined),
    };
  });

  describe('listRoles', () => {
    it('returns a list of roles with permissions and account counts', async () => {
      const mockRoles = [
        {
          id: 'role-1',
          code: 'admin',
          name: 'Administrator',
          description: 'Admin role',
          isSystem: true,
          isActive: true,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          rolePermissions: [{ permissionKey: 'identity.permissions.read' }],
          _count: { accountAssignments: 2 },
        },
      ];

      mockPrisma = {
        role: {
          findMany: jest.fn().mockResolvedValue(mockRoles),
        },
      };

      service = new RoleService(
        mockPrisma as PrismaService,
        mockAuditService as AuditService,
      );
      const result = await service.listRoles({});

      expect(result.data.roles).toHaveLength(1);
      expect(result.data.roles[0].code).toBe('admin');
      expect(result.data.roles[0].permission_keys).toContain(
        'identity.permissions.read',
      );
      expect(result.data.roles[0].assigned_account_count).toBe(2);
    });
  });

  describe('createRole', () => {
    it('creates a role with valid permissions successfully', async () => {
      const newRole = {
        id: 'role-new',
        code: 'custom_role',
        name: 'Custom Role',
        description: 'Custom',
        isSystem: false,
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        rolePermissions: [{ permissionKey: 'identity.me.read' }],
        _count: { accountAssignments: 0 },
      };

      mockPrisma = {
        role: {
          findUnique: jest
            .fn()
            .mockImplementation(
              ({ where }: { where: Record<string, string> }) => {
                if (where.code === 'custom_role') return Promise.resolve(null);
                if (where.id === 'role-new') return Promise.resolve(newRole);
                return Promise.resolve(null);
              },
            ),
          create: jest.fn().mockResolvedValue(newRole),
        },
        rolePermission: {
          createMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        $transaction: jest
          .fn()
          .mockImplementation((cb: (tx: any) => Promise<unknown>) =>
            cb(mockPrisma),
          ),
      };

      service = new RoleService(
        mockPrisma as PrismaService,
        mockAuditService as AuditService,
      );
      const result = await service.createRole('actor-1', {
        code: 'custom_role',
        name: 'Custom Role',
        description: 'Custom',
        permission_keys: ['identity.me.read'],
      });

      expect(result.data.code).toBe('custom_role');
      expect(mockAuditService.record).toHaveBeenCalled();
    });

    it('rejects creation when an unknown permission key is provided', async () => {
      mockPrisma = {
        role: { findUnique: jest.fn().mockResolvedValue(null) },
      };

      service = new RoleService(
        mockPrisma as PrismaService,
        mockAuditService as AuditService,
      );

      await expect(
        service.createRole('actor-1', {
          code: 'custom_role',
          name: 'Custom Role',
          permission_keys: ['invalid.permission.key'],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects creation with critical permissions when confirm_critical is not set', async () => {
      mockPrisma = {
        role: { findUnique: jest.fn().mockResolvedValue(null) },
      };

      service = new RoleService(
        mockPrisma as PrismaService,
        mockAuditService as AuditService,
      );

      await expect(
        service.createRole('actor-1', {
          code: 'custom_role',
          name: 'Custom Role',
          permission_keys: ['identity.permissions.manage'], // critical risk
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects creation if role code already exists', async () => {
      mockPrisma = {
        role: { findUnique: jest.fn().mockResolvedValue({ id: 'existing' }) },
      };

      service = new RoleService(
        mockPrisma as PrismaService,
        mockAuditService as AuditService,
      );

      await expect(
        service.createRole('actor-1', {
          code: 'admin',
          name: 'Administrator',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateRole', () => {
    it('renames and updates role successfully with atomic version check', async () => {
      const existingRole = {
        id: 'role-1',
        code: 'custom_role',
        name: 'Old Name',
        description: 'Old Desc',
        isSystem: false,
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        rolePermissions: [],
        _count: { accountAssignments: 0 },
      };

      const updatedRole = {
        ...existingRole,
        name: 'New Name',
        version: 2,
      };

      let callCount = 0;
      mockPrisma = {
        role: {
          findUnique: jest.fn().mockImplementation(() => {
            callCount++;
            return Promise.resolve(
              callCount === 1 ? existingRole : updatedRole,
            );
          }),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        $transaction: jest
          .fn()
          .mockImplementation((cb: (tx: any) => Promise<unknown>) =>
            cb(mockPrisma),
          ),
      };

      service = new RoleService(
        mockPrisma as PrismaService,
        mockAuditService as AuditService,
      );
      const result = await service.updateRole('actor-1', 'role-1', {
        name: 'New Name',
        version: 1,
      });

      expect(result.data.name).toBe('New Name');
      expect(result.data.version).toBe(2);
      expect(
        (mockPrisma as { role: { updateMany: jest.Mock } }).role.updateMany,
      ).toHaveBeenCalledWith({
        where: { id: 'role-1', version: 1 },
        data: {
          name: 'New Name',
          version: { increment: 1 },
        },
      });
    });

    it('throws ConflictException on optimistic version conflict before query', async () => {
      const existingRole = {
        id: 'role-1',
        version: 2,
      };

      mockPrisma = {
        role: { findUnique: jest.fn().mockResolvedValue(existingRole) },
      };

      service = new RoleService(
        mockPrisma as PrismaService,
        mockAuditService as AuditService,
      );

      await expect(
        service.updateRole('actor-1', 'role-1', {
          name: 'New Name',
          version: 1, // outdated version
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException when DB updateMany fails atomic version check (count === 0)', async () => {
      const existingRole = {
        id: 'role-1',
        version: 1,
      };

      mockPrisma = {
        role: {
          findUnique: jest.fn().mockResolvedValue(existingRole),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        $transaction: jest
          .fn()
          .mockImplementation((cb: (tx: any) => Promise<unknown>) =>
            cb(mockPrisma),
          ),
      };

      service = new RoleService(
        mockPrisma as PrismaService,
        mockAuditService as AuditService,
      );

      await expect(
        service.updateRole('actor-1', 'role-1', {
          name: 'New Name',
          version: 1,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateRoleStatus', () => {
    it('prevents deactivating system role', async () => {
      const systemRole = {
        id: 'role-super-admin',
        code: 'super_admin',
        isSystem: true,
        isActive: true,
        version: 1,
      };

      mockPrisma = {
        role: { findUnique: jest.fn().mockResolvedValue(systemRole) },
      };

      service = new RoleService(
        mockPrisma as PrismaService,
        mockAuditService as AuditService,
      );

      await expect(
        service.updateRoleStatus('actor-1', 'role-super-admin', {
          is_active: false,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException on DB atomic updateMany version mismatch', async () => {
      const existingRole = {
        id: 'role-1',
        code: 'custom_role',
        isSystem: false,
        isActive: true,
        version: 2,
      };

      mockPrisma = {
        role: {
          findUnique: jest.fn().mockResolvedValue(existingRole),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        $transaction: jest
          .fn()
          .mockImplementation((cb: (tx: any) => Promise<unknown>) =>
            cb(mockPrisma),
          ),
      };

      service = new RoleService(
        mockPrisma as PrismaService,
        mockAuditService as AuditService,
      );

      await expect(
        service.updateRoleStatus('actor-1', 'role-1', {
          is_active: false,
          version: 2,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('replaceRolePermissions', () => {
    it('prevents removing critical management permissions from super_admin role', async () => {
      const superAdminRole = {
        id: 'role-super-admin',
        code: 'super_admin',
        isSystem: true,
        isActive: true,
        version: 1,
        rolePermissions: [
          { permissionKey: 'identity.permissions.manage' },
          { permissionKey: 'identity.me.read' },
        ],
      };

      mockPrisma = {
        role: { findUnique: jest.fn().mockResolvedValue(superAdminRole) },
      };

      service = new RoleService(
        mockPrisma as PrismaService,
        mockAuditService as AuditService,
      );

      await expect(
        service.replaceRolePermissions('actor-1', 'role-super-admin', {
          permission_keys: ['identity.me.read'], // removing identity.permissions.manage
          confirm_critical: true,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ConflictException when atomic version check fails on permission replace', async () => {
      const role = {
        id: 'role-1',
        code: 'custom_role',
        isSystem: false,
        isActive: true,
        version: 1,
        rolePermissions: [{ permissionKey: 'identity.me.read' }],
      };

      mockPrisma = {
        role: {
          findUnique: jest.fn().mockResolvedValue(role),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        $transaction: jest
          .fn()
          .mockImplementation((cb: (tx: any) => Promise<unknown>) =>
            cb(mockPrisma),
          ),
      };

      service = new RoleService(
        mockPrisma as PrismaService,
        mockAuditService as AuditService,
      );

      await expect(
        service.replaceRolePermissions('actor-1', 'role-1', {
          permission_keys: ['identity.me.read'],
          version: 1,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('assignAccountRoles', () => {
    it('prevents self-demotion when actor removes super_admin from own account', async () => {
      const targetAccount = {
        id: 'actor-1',
        role: 'super_admin',
        roleAssignments: [
          {
            role: {
              code: 'super_admin',
              rolePermissions: [
                { permissionKey: 'identity.permissions.manage' },
              ],
            },
          },
        ],
      };

      const regularRole = {
        id: 'role-teacher',
        code: 'teacher',
        isActive: true,
      };

      mockPrisma = {
        account: { findUnique: jest.fn().mockResolvedValue(targetAccount) },
        role: { findMany: jest.fn().mockResolvedValue([regularRole]) },
        $transaction: jest
          .fn()
          .mockImplementation((cb: (tx: any) => Promise<unknown>) =>
            cb(mockPrisma),
          ),
      };

      service = new RoleService(
        mockPrisma as PrismaService,
        mockAuditService as AuditService,
      );

      await expect(
        service.assignAccountRoles('actor-1', 'actor-1', {
          role_ids: ['role-teacher'],
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('prevents demoting the last active super_admin in system inside transaction with serializable isolation', async () => {
      const targetAccount = {
        id: 'account-last-admin',
        role: 'super_admin',
        roleAssignments: [
          {
            role: {
              code: 'super_admin',
              rolePermissions: [
                { permissionKey: 'identity.permissions.manage' },
              ],
            },
          },
        ],
      };

      const teacherRole = {
        id: 'role-teacher',
        code: 'teacher',
        isActive: true,
      };

      mockPrisma = {
        account: {
          findUnique: jest.fn().mockResolvedValue(targetAccount),
          count: jest.fn().mockResolvedValue(1), // last super_admin account
        },
        role: { findMany: jest.fn().mockResolvedValue([teacherRole]) },
        accountRoleAssignment: {
          count: jest.fn().mockResolvedValue(1),
        },
        $transaction: jest
          .fn()
          .mockImplementation(
            (cb: (tx: any) => Promise<unknown>, options?: any) => {
              expect(options).toEqual({ isolationLevel: 'Serializable' });
              return cb(mockPrisma);
            },
          ),
      };

      service = new RoleService(
        mockPrisma as PrismaService,
        mockAuditService as AuditService,
      );

      await expect(
        service.assignAccountRoles('actor-admin-2', 'account-last-admin', {
          role_ids: ['role-teacher'],
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects assigning roles with critical permissions when confirm_critical is not set', async () => {
      const targetAccount = {
        id: 'account-1',
        role: 'admin',
        roleAssignments: [],
      };

      const criticalRole = {
        id: 'role-critical',
        code: 'role_manager',
        isActive: true,
        rolePermissions: [{ permissionKey: 'identity.permissions.manage' }],
      };

      mockPrisma = {
        account: { findUnique: jest.fn().mockResolvedValue(targetAccount) },
        role: { findMany: jest.fn().mockResolvedValue([criticalRole]) },
        $transaction: jest
          .fn()
          .mockImplementation((cb: (tx: any) => Promise<unknown>) =>
            cb(mockPrisma),
          ),
      };

      service = new RoleService(
        mockPrisma as PrismaService,
        mockAuditService as AuditService,
      );

      await expect(
        service.assignAccountRoles('actor-1', 'account-1', {
          role_ids: ['role-critical'],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('allows assigning roles with critical permissions when confirm_critical is true', async () => {
      const targetAccount = {
        id: 'account-1',
        role: 'admin',
        roleAssignments: [],
      };

      const criticalRole = {
        id: 'role-critical',
        code: 'admin',
        isActive: true,
        rolePermissions: [{ permissionKey: 'identity.permissions.manage' }],
      };

      mockPrisma = {
        account: {
          findUnique: jest.fn().mockResolvedValue(targetAccount),
          update: jest.fn().mockResolvedValue({ id: 'account-1' }),
        },
        role: { findMany: jest.fn().mockResolvedValue([criticalRole]) },
        accountRoleAssignment: {
          deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
          createMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        $transaction: jest
          .fn()
          .mockImplementation((cb: (tx: any) => Promise<unknown>) =>
            cb(mockPrisma),
          ),
      };

      service = new RoleService(
        mockPrisma as PrismaService,
        mockAuditService as AuditService,
      );

      const result = await service.assignAccountRoles('actor-1', 'account-1', {
        role_ids: ['role-critical'],
        confirm_critical: true,
      });

      expect(result.data.account_id).toBe('account-1');
      expect(result.data.assigned_role_ids).toEqual(['role-critical']);
      expect(mockAuditService.record).toHaveBeenCalled();
    });

    it('rejects removing a role-derived critical permission when confirm_critical is not set', async () => {
      const currentCriticalRole = {
        id: 'role-critical',
        code: 'role_manager',
        isActive: true,
        rolePermissions: [{ permissionKey: 'identity.permissions.manage' }],
      };

      const targetAccount = {
        id: 'account-1',
        role: 'admin',
        roleAssignments: [{ role: currentCriticalRole }],
      };

      const regularRole = {
        id: 'role-regular',
        code: 'regular_role',
        isActive: true,
        rolePermissions: [{ permissionKey: 'identity.me.read' }],
      };

      mockPrisma = {
        account: { findUnique: jest.fn().mockResolvedValue(targetAccount) },
        role: { findMany: jest.fn().mockResolvedValue([regularRole]) },
        $transaction: jest
          .fn()
          .mockImplementation((cb: (tx: any) => Promise<unknown>) =>
            cb(mockPrisma),
          ),
      };

      service = new RoleService(
        mockPrisma as PrismaService,
        mockAuditService as AuditService,
      );

      await expect(
        service.assignAccountRoles('actor-1', 'account-1', {
          role_ids: ['role-regular'],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('allows assigning roles without confirm_critical when unchanged critical effective permission is reassigned', async () => {
      const currentCriticalRole = {
        id: 'role-critical-1',
        code: 'role_manager_1',
        isActive: true,
        rolePermissions: [{ permissionKey: 'identity.permissions.manage' }],
      };

      const targetAccount = {
        id: 'account-1',
        role: 'admin',
        roleAssignments: [{ role: currentCriticalRole }],
      };

      const newCriticalRole = {
        id: 'role-critical-2',
        code: 'role_manager_2',
        isActive: true,
        rolePermissions: [{ permissionKey: 'identity.permissions.manage' }],
      };

      mockPrisma = {
        account: {
          findUnique: jest.fn().mockResolvedValue(targetAccount),
          update: jest.fn().mockResolvedValue({ id: 'account-1' }),
        },
        role: { findMany: jest.fn().mockResolvedValue([newCriticalRole]) },
        accountRoleAssignment: {
          deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
          createMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        $transaction: jest
          .fn()
          .mockImplementation((cb: (tx: any) => Promise<unknown>) =>
            cb(mockPrisma),
          ),
      };

      service = new RoleService(
        mockPrisma as PrismaService,
        mockAuditService as AuditService,
      );

      const result = await service.assignAccountRoles('actor-1', 'account-1', {
        role_ids: ['role-critical-2'],
      });

      expect(result.data.account_id).toBe('account-1');
      expect(result.data.assigned_role_ids).toEqual(['role-critical-2']);
      expect(mockAuditService.record).toHaveBeenCalled();
    });
  });
});
