import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AccountRole, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  isPermissionKey,
  PERMISSIONS,
} from '../permissions/permission.registry';
import type {
  AssignAccountRolesDto,
  CreateRoleDto,
  ListRolesQueryDto,
  ReplaceRolePermissionsDto,
  UpdateRoleDto,
  UpdateRoleStatusDto,
} from './role.validation';

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listRoles(query: ListRolesQueryDto = {}) {
    const where: Prisma.RoleWhereInput = {};

    if (query.is_active !== undefined) {
      where.isActive = query.is_active;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const roles = await this.prisma.role.findMany({
      where,
      include: {
        rolePermissions: {
          select: { permissionKey: true },
        },
        _count: {
          select: { accountAssignments: true },
        },
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });

    return {
      data: {
        roles: roles.map((role) => ({
          id: role.id,
          code: role.code,
          name: role.name,
          description: role.description,
          is_system: role.isSystem,
          is_active: role.isActive,
          version: role.version,
          permission_keys: role.rolePermissions.map((rp) => rp.permissionKey),
          assigned_account_count: role._count.accountAssignments,
          created_at: role.createdAt.toISOString(),
          updated_at: role.updatedAt.toISOString(),
        })),
      },
    };
  }

  async getRoleById(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          select: { permissionKey: true },
        },
        _count: {
          select: { accountAssignments: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      data: {
        id: role.id,
        code: role.code,
        name: role.name,
        description: role.description,
        is_system: role.isSystem,
        is_active: role.isActive,
        version: role.version,
        permission_keys:
          role.rolePermissions?.map((rp) => rp.permissionKey) ?? [],
        assigned_account_count: role._count?.accountAssignments ?? 0,
        created_at: role.createdAt.toISOString(),
        updated_at: role.updatedAt.toISOString(),
      },
    };
  }

  async createRole(actorId: string, payload: CreateRoleDto) {
    const permissionKeys = payload.permission_keys ?? [];

    for (const key of permissionKeys) {
      if (!isPermissionKey(key)) {
        throw new BadRequestException(`Unknown permission key: ${key}`);
      }
    }

    const hasCritical = permissionKeys.some((key) => {
      const def = PERMISSIONS.find((p) => p.key === key);
      return def && def.risk === 'critical';
    });

    if (hasCritical && !payload.confirm_critical) {
      throw new BadRequestException(
        'Explicit confirmation required for critical permission changes',
      );
    }

    const existingCode = await this.prisma.role.findUnique({
      where: { code: payload.code },
      select: { id: true },
    });

    if (existingCode) {
      throw new ConflictException('Role code already exists');
    }

    const role = await this.prisma.$transaction(async (tx) => {
      const created = await tx.role.create({
        data: {
          code: payload.code,
          name: payload.name,
          description: payload.description,
          isSystem: false,
          isActive: true,
          version: 1,
        },
      });

      if (permissionKeys.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionKeys.map((key) => ({
            roleId: created.id,
            permissionKey: key,
          })),
        });
      }

      await this.auditService.record(
        {
          actorId,
          action: 'role.create',
          boundedContext: 'Identity & Access',
          resourceType: 'role',
          resourceId: created.id,
          metadata: {
            code: created.code,
            name: created.name,
            permission_keys: permissionKeys,
          },
        },
        tx,
      );

      return created;
    });

    return this.getRoleById(role.id);
  }

  async updateRole(actorId: string, roleId: string, payload: UpdateRoleDto) {
    const existingRole = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    if (
      payload.version !== undefined &&
      existingRole.version !== payload.version
    ) {
      throw new ConflictException('Role version conflict');
    }

    const expectedVersion = payload.version ?? existingRole.version;

    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.role.updateMany({
        where: { id: roleId, version: expectedVersion },
        data: {
          ...(payload.name !== undefined ? { name: payload.name } : {}),
          ...(payload.description !== undefined
            ? { description: payload.description }
            : {}),
          version: { increment: 1 },
        },
      });

      if (count === 0) {
        const current = await tx.role.findUnique({ where: { id: roleId } });
        if (!current) {
          throw new NotFoundException('Role not found');
        }
        throw new ConflictException('Role version conflict');
      }

      await this.auditService.record(
        {
          actorId,
          action: 'role.update',
          boundedContext: 'Identity & Access',
          resourceType: 'role',
          resourceId: roleId,
          metadata: {
            name: payload.name,
            description: payload.description,
          },
        },
        tx,
      );
    });

    return this.getRoleById(roleId);
  }

  async updateRoleStatus(
    actorId: string,
    roleId: string,
    payload: UpdateRoleStatusDto,
  ) {
    const existingRole = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    if (
      !payload.is_active &&
      (existingRole.isSystem || existingRole.code === 'super_admin')
    ) {
      throw new BadRequestException('System roles cannot be deactivated');
    }

    if (
      payload.version !== undefined &&
      existingRole.version !== payload.version
    ) {
      throw new ConflictException('Role version conflict');
    }

    const expectedVersion = payload.version ?? existingRole.version;

    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.role.updateMany({
        where: { id: roleId, version: expectedVersion },
        data: {
          isActive: payload.is_active,
          version: { increment: 1 },
        },
      });

      if (count === 0) {
        const current = await tx.role.findUnique({ where: { id: roleId } });
        if (!current) {
          throw new NotFoundException('Role not found');
        }
        throw new ConflictException('Role version conflict');
      }

      await this.auditService.record(
        {
          actorId,
          action: 'role.status.update',
          boundedContext: 'Identity & Access',
          resourceType: 'role',
          resourceId: roleId,
          metadata: {
            is_active: payload.is_active,
          },
        },
        tx,
      );
    });

    return this.getRoleById(roleId);
  }

  async replaceRolePermissions(
    actorId: string,
    roleId: string,
    payload: ReplaceRolePermissionsDto,
  ) {
    const existingRole = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          select: { permissionKey: true },
        },
      },
    });

    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    for (const key of payload.permission_keys) {
      if (!isPermissionKey(key)) {
        throw new BadRequestException(`Unknown permission key: ${key}`);
      }
    }

    if (existingRole.code === 'super_admin') {
      const criticalSuperAdminKeys = [
        'identity.permissions.manage',
        'users.manage',
      ];
      const missingCriticalKeys = criticalSuperAdminKeys.filter(
        (key) => !payload.permission_keys.includes(key),
      );
      if (missingCriticalKeys.length > 0) {
        throw new ForbiddenException(
          'Cannot remove critical management permissions from super_admin role',
        );
      }
    }

    const currentKeys = existingRole.rolePermissions.map(
      (rp) => rp.permissionKey,
    );
    const addedKeys = payload.permission_keys.filter(
      (k) => !currentKeys.includes(k),
    );
    const removedKeys = currentKeys.filter(
      (k) => !payload.permission_keys.includes(k),
    );

    const changedKeys = [...addedKeys, ...removedKeys];
    const hasCriticalChange = changedKeys.some((key) => {
      const def = PERMISSIONS.find((p) => p.key === key);
      return def && def.risk === 'critical';
    });

    if (hasCriticalChange && !payload.confirm_critical) {
      throw new BadRequestException(
        'Explicit confirmation required for critical permission changes',
      );
    }

    if (
      payload.version !== undefined &&
      existingRole.version !== payload.version
    ) {
      throw new ConflictException('Role version conflict');
    }

    const expectedVersion = payload.version ?? existingRole.version;

    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.role.updateMany({
        where: { id: roleId, version: expectedVersion },
        data: {
          version: { increment: 1 },
        },
      });

      if (count === 0) {
        const current = await tx.role.findUnique({ where: { id: roleId } });
        if (!current) {
          throw new NotFoundException('Role not found');
        }
        throw new ConflictException('Role version conflict');
      }

      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      if (payload.permission_keys.length > 0) {
        await tx.rolePermission.createMany({
          data: payload.permission_keys.map((key) => ({
            roleId,
            permissionKey: key,
          })),
        });
      }

      await this.auditService.record(
        {
          actorId,
          action: 'role.permissions.update',
          boundedContext: 'Identity & Access',
          resourceType: 'role',
          resourceId: roleId,
          metadata: {
            permission_keys: payload.permission_keys,
          },
        },
        tx,
      );
    });

    return this.getRoleById(roleId);
  }

  async assignAccountRoles(
    actorId: string,
    accountId: string,
    payload: AssignAccountRolesDto,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const account = await tx.account.findUnique({
          where: { id: accountId },
          include: {
            roleAssignments: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      select: { permissionKey: true },
                    },
                  },
                },
              },
            },
          },
        });

        if (!account) {
          throw new NotFoundException('Account not found');
        }

        const targetRoles = await tx.role.findMany({
          where: { id: { in: payload.role_ids } },
          include: {
            rolePermissions: {
              select: { permissionKey: true },
            },
          },
        });

        if (targetRoles.length !== payload.role_ids.length) {
          throw new BadRequestException(
            'One or more specified roles do not exist',
          );
        }

        const inactiveRole = targetRoles.find((r) => !r.isActive);
        if (inactiveRole) {
          throw new BadRequestException(
            `Cannot assign inactive role: ${inactiveRole.name}`,
          );
        }

        const currentPermissions = Array.from(
          new Set(
            account.roleAssignments.flatMap(
              (ra) =>
                ra.role?.rolePermissions?.map((rp) => rp.permissionKey) ?? [],
            ),
          ),
        );

        const targetPermissions = Array.from(
          new Set(
            targetRoles.flatMap(
              (r) => r.rolePermissions?.map((rp) => rp.permissionKey) ?? [],
            ),
          ),
        );

        const addedKeys = targetPermissions.filter(
          (k) => !currentPermissions.includes(k),
        );
        const removedKeys = currentPermissions.filter(
          (k) => !targetPermissions.includes(k),
        );
        const changedKeys = [...addedKeys, ...removedKeys];

        const hasCriticalChange = changedKeys.some((key) => {
          const def = PERMISSIONS.find((p) => p.key === key);
          return def && def.risk === 'critical';
        });

        const currentlyIsSuperAdmin =
          account.role === 'super_admin' ||
          account.roleAssignments.some((ra) => ra.role.code === 'super_admin');

        const willBeSuperAdmin = targetRoles.some(
          (r) => r.code === 'super_admin',
        );

        if (currentlyIsSuperAdmin && !willBeSuperAdmin) {
          if (actorId === accountId) {
            throw new ForbiddenException('Self-demotion is not allowed');
          }

          const superAdminCount = await tx.account.count({
            where: {
              OR: [
                { role: 'super_admin' },
                {
                  roleAssignments: {
                    some: { role: { code: 'super_admin' } },
                  },
                },
              ],
              isActive: true,
            },
          });

          if (superAdminCount <= 1) {
            throw new ForbiddenException(
              'Cannot demote the last super admin account',
            );
          }
        }

        if (hasCriticalChange && !payload.confirm_critical) {
          throw new BadRequestException(
            'Explicit confirmation required for critical permission changes',
          );
        }

        const legacyRole: AccountRole = willBeSuperAdmin
          ? 'super_admin'
          : targetRoles.some((r) => r.code === 'admin')
            ? 'admin'
            : targetRoles.some((r) => r.code === 'teacher')
              ? 'teacher'
              : targetRoles.some((r) => r.code === 'student')
                ? 'student'
                : targetRoles.some((r) => r.code === 'parent')
                  ? 'parent'
                  : 'admin';

        await tx.accountRoleAssignment.deleteMany({
          where: { accountId },
        });

        await tx.accountRoleAssignment.createMany({
          data: payload.role_ids.map((roleId) => ({
            accountId,
            roleId,
            assignedById: actorId,
          })),
        });

        await tx.account.update({
          where: { id: accountId },
          data: { role: legacyRole },
        });

        await this.auditService.record(
          {
            actorId,
            action: 'account.roles.assign',
            boundedContext: 'Identity & Access',
            resourceType: 'account',
            resourceId: accountId,
            metadata: {
              assigned_role_ids: payload.role_ids,
            },
          },
          tx,
        );

        return {
          data: {
            account_id: accountId,
            assigned_role_ids: payload.role_ids,
            legacy_role: legacyRole,
          },
        };
      },
      {
        isolationLevel: 'Serializable' as Prisma.TransactionIsolationLevel,
      },
    );
  }
}
