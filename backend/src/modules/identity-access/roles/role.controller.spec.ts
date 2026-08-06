import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import {
  REQUIRED_PERMISSIONS_KEY,
  REQUIRED_ROLES_KEY,
} from '../../../common/auth/auth.constants';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

describe('RoleController', () => {
  let controller: RoleController;
  let roleService: jest.Mocked<Partial<RoleService>>;
  let reflector: Reflector;

  const mockActor: AuthenticatedUser = {
    id: 'account-admin-1',
    username: 'admin',
    role: 'admin',
  };

  beforeEach(async () => {
    roleService = {
      listRoles: jest.fn().mockResolvedValue({ data: { roles: [] } }),
      getRoleById: jest.fn().mockResolvedValue({ data: { id: 'role-1' } }),
      createRole: jest.fn().mockResolvedValue({ data: { id: 'role-1' } }),
      updateRole: jest.fn().mockResolvedValue({ data: { id: 'role-1' } }),
      updateRoleStatus: jest.fn().mockResolvedValue({ data: { id: 'role-1' } }),
      replaceRolePermissions: jest
        .fn()
        .mockResolvedValue({ data: { id: 'role-1' } }),
      assignAccountRoles: jest
        .fn()
        .mockResolvedValue({ data: { account_id: 'account-1' } }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: roleService,
        },
      ],
    }).compile();

    controller = module.get(RoleController);
    reflector = new Reflector();
  });

  /* eslint-disable @typescript-eslint/unbound-method */
  describe('Route Metadata & Auth Decorators', () => {
    it('has RequireRole admin and super_admin on the class', () => {
      const roles = reflector.get<string[]>(REQUIRED_ROLES_KEY, RoleController);
      expect(roles).toEqual(['admin', 'super_admin']);
    });

    it('has RequirePermission identity.roles.read on listRoles', () => {
      const permissions = reflector.get<string[]>(
        REQUIRED_PERMISSIONS_KEY,
        RoleController.prototype.listRoles,
      );
      expect(permissions).toEqual(['identity.roles.read']);
    });

    it('has RequirePermission identity.roles.read on getRoleById', () => {
      const permissions = reflector.get<string[]>(
        REQUIRED_PERMISSIONS_KEY,
        RoleController.prototype.getRoleById,
      );
      expect(permissions).toEqual(['identity.roles.read']);
    });

    it('has RequirePermission identity.roles.manage on createRole', () => {
      const permissions = reflector.get<string[]>(
        REQUIRED_PERMISSIONS_KEY,
        RoleController.prototype.createRole,
      );
      expect(permissions).toEqual(['identity.roles.manage']);
    });

    it('has RequirePermission identity.roles.manage on updateRole', () => {
      const permissions = reflector.get<string[]>(
        REQUIRED_PERMISSIONS_KEY,
        RoleController.prototype.updateRole,
      );
      expect(permissions).toEqual(['identity.roles.manage']);
    });

    it('has RequirePermission identity.roles.manage on updateRoleStatus', () => {
      const permissions = reflector.get<string[]>(
        REQUIRED_PERMISSIONS_KEY,
        RoleController.prototype.updateRoleStatus,
      );
      expect(permissions).toEqual(['identity.roles.manage']);
    });

    it('has RequirePermission identity.roles.manage on replaceRolePermissions', () => {
      const permissions = reflector.get<string[]>(
        REQUIRED_PERMISSIONS_KEY,
        RoleController.prototype.replaceRolePermissions,
      );
      expect(permissions).toEqual(['identity.roles.manage']);
    });

    it('has RequirePermission identity.roles.manage on assignAccountRoles', () => {
      const permissions = reflector.get<string[]>(
        REQUIRED_PERMISSIONS_KEY,
        RoleController.prototype.assignAccountRoles,
      );
      expect(permissions).toEqual(['identity.roles.manage']);
    });
  });
  /* eslint-enable @typescript-eslint/unbound-method */

  describe('Validation (Negative Cases)', () => {
    it('throws BadRequestException on invalid list query', () => {
      expect(() => controller.listRoles({ is_active: 123 })).toThrow(
        BadRequestException,
      );
      expect(roleService.listRoles).not.toHaveBeenCalled();
    });

    it('throws BadRequestException on create role with invalid code', () => {
      expect(() =>
        controller.createRole(mockActor, {
          code: 'Invalid Code!',
          name: 'Test Role',
        }),
      ).toThrow(BadRequestException);
      expect(roleService.createRole).not.toHaveBeenCalled();
    });

    it('throws BadRequestException on create role with empty name', () => {
      expect(() =>
        controller.createRole(mockActor, {
          code: 'test_role',
          name: '   ',
        }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException on update role with empty payload', () => {
      expect(() => controller.updateRole(mockActor, 'role-1', {})).toThrow(
        BadRequestException,
      );
      expect(roleService.updateRole).not.toHaveBeenCalled();
    });

    it('throws BadRequestException on update role status with invalid payload', () => {
      expect(() =>
        controller.updateRoleStatus(mockActor, 'role-1', {
          is_active: 'maybe',
        }),
      ).toThrow(BadRequestException);
      expect(roleService.updateRoleStatus).not.toHaveBeenCalled();
    });

    it('throws BadRequestException on replace permissions with missing array', () => {
      expect(() =>
        controller.replaceRolePermissions(mockActor, 'role-1', {}),
      ).toThrow(BadRequestException);
      expect(roleService.replaceRolePermissions).not.toHaveBeenCalled();
    });

    it('throws BadRequestException on assign account roles with empty array', () => {
      expect(() =>
        controller.assignAccountRoles(mockActor, 'account-1', {
          role_ids: [],
        }),
      ).toThrow(BadRequestException);
      expect(roleService.assignAccountRoles).not.toHaveBeenCalled();
    });
  });

  describe('Delegation & Mapping (Positive Cases)', () => {
    it('delegates listRoles with parsed query', async () => {
      await controller.listRoles({ search: '  admin  ', is_active: 'true' });
      expect(roleService.listRoles).toHaveBeenCalledWith({
        search: 'admin',
        is_active: true,
      });
    });

    it('delegates getRoleById with id parameter', async () => {
      await controller.getRoleById('role-123');
      expect(roleService.getRoleById).toHaveBeenCalledWith('role-123');
    });

    it('delegates createRole with actor ID and validated DTO', async () => {
      const body = {
        code: 'custom_editor',
        name: 'Content Editor',
        description: 'Edits news',
        permission_keys: ['communication.news.manage'],
      };
      await controller.createRole(mockActor, body);
      expect(roleService.createRole).toHaveBeenCalledWith(
        'account-admin-1',
        body,
      );
    });

    it('delegates updateRole with actor ID, role ID and validated DTO', async () => {
      const body = { name: 'Renamed Role', version: 1 };
      await controller.updateRole(mockActor, 'role-1', body);
      expect(roleService.updateRole).toHaveBeenCalledWith(
        'account-admin-1',
        'role-1',
        body,
      );
    });

    it('delegates updateRoleStatus with actor ID, role ID and validated DTO', async () => {
      const body = { is_active: false, version: 2 };
      await controller.updateRoleStatus(mockActor, 'role-1', body);
      expect(roleService.updateRoleStatus).toHaveBeenCalledWith(
        'account-admin-1',
        'role-1',
        body,
      );
    });

    it('delegates replaceRolePermissions with actor ID, role ID and validated DTO', async () => {
      const body = {
        permission_keys: ['identity.roles.read'],
        confirm_critical: true,
      };
      await controller.replaceRolePermissions(mockActor, 'role-1', body);
      expect(roleService.replaceRolePermissions).toHaveBeenCalledWith(
        'account-admin-1',
        'role-1',
        body,
      );
    });

    it('delegates assignAccountRoles with actor ID, account ID and validated DTO', async () => {
      const body = { role_ids: ['role-1', 'role-2'] };
      await controller.assignAccountRoles(mockActor, 'account-99', body);
      expect(roleService.assignAccountRoles).toHaveBeenCalledWith(
        'account-admin-1',
        'account-99',
        body,
      );
    });

    it('throws UnauthorizedException when actor is missing (fail-closed)', () => {
      const body = { name: 'New Name' };
      expect(() =>
        controller.createRole(undefined, {
          code: 'test_role',
          name: 'Test',
        }),
      ).toThrow(UnauthorizedException);
      expect(() => controller.updateRole(undefined, 'role-1', body)).toThrow(
        UnauthorizedException,
      );
      expect(() =>
        controller.updateRoleStatus(undefined, 'role-1', { is_active: true }),
      ).toThrow(UnauthorizedException);
      expect(() =>
        controller.replaceRolePermissions(undefined, 'role-1', {
          permission_keys: ['identity.roles.read'],
        }),
      ).toThrow(UnauthorizedException);
      expect(() =>
        controller.assignAccountRoles(undefined, 'account-1', {
          role_ids: ['role-1'],
        }),
      ).toThrow(UnauthorizedException);
      expect(roleService.updateRole).not.toHaveBeenCalled();
    });
  });
});
