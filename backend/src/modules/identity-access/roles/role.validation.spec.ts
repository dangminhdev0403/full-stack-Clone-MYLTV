import { BadRequestException } from '@nestjs/common';
import {
  validateCreateRole,
  validateListRolesQuery,
  validateReplaceRolePermissions,
  validateUpdateRole,
  validateUpdateRoleStatus,
} from './role.validation';

describe('role.validation', () => {
  describe('validateListRolesQuery', () => {
    it('throws BadRequestException when is_active is invalid like "yes"', () => {
      expect(() =>
        validateListRolesQuery({ is_active: 'yes' as unknown as boolean }),
      ).toThrow(BadRequestException);
    });

    it('allows valid boolean and string booleans or missing is_active', () => {
      expect(validateListRolesQuery({})).toEqual({});
      expect(validateListRolesQuery({ is_active: true })).toEqual({
        is_active: true,
      });
      expect(validateListRolesQuery({ is_active: 'true' })).toEqual({
        is_active: true,
      });
      expect(validateListRolesQuery({ is_active: 'false' })).toEqual({
        is_active: false,
      });
    });
  });

  describe('permission_keys uniqueness', () => {
    it('throws BadRequestException when createRole receives duplicate permission_keys', () => {
      expect(() =>
        validateCreateRole({
          code: 'test_role',
          name: 'Test Role',
          permission_keys: ['identity.roles.read', 'identity.roles.read'],
        }),
      ).toThrow(BadRequestException);
    });

    it('allows createRole with unique permission_keys or without permission_keys', () => {
      const result = validateCreateRole({
        code: 'test_role',
        name: 'Test Role',
        permission_keys: ['identity.roles.read', 'identity.roles.manage'],
      });
      expect(result.permission_keys).toEqual([
        'identity.roles.read',
        'identity.roles.manage',
      ]);
    });

    it('throws BadRequestException when replaceRolePermissions receives duplicate permission_keys', () => {
      expect(() =>
        validateReplaceRolePermissions({
          permission_keys: ['identity.roles.read', 'identity.roles.read'],
        }),
      ).toThrow(BadRequestException);
    });

    it('allows replaceRolePermissions with unique permission_keys', () => {
      const result = validateReplaceRolePermissions({
        permission_keys: ['identity.roles.read', 'identity.roles.manage'],
      });
      expect(result.permission_keys).toEqual([
        'identity.roles.read',
        'identity.roles.manage',
      ]);
    });
  });

  describe('version positive integer requirement', () => {
    it('throws BadRequestException when updateRole has version = 0', () => {
      expect(() =>
        validateUpdateRole({
          name: 'Updated Name',
          version: 0,
        }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException when updateRole has version < 0', () => {
      expect(() =>
        validateUpdateRole({
          name: 'Updated Name',
          version: -1,
        }),
      ).toThrow(BadRequestException);
    });

    it('allows updateRole with positive integer version', () => {
      const result = validateUpdateRole({
        name: 'Updated Name',
        version: 1,
      });
      expect(result.version).toBe(1);
    });

    it('throws BadRequestException when updateRoleStatus has version = 0', () => {
      expect(() =>
        validateUpdateRoleStatus({
          is_active: false,
          version: 0,
        }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException when updateRoleStatus has version < 0', () => {
      expect(() =>
        validateUpdateRoleStatus({
          is_active: false,
          version: -5,
        }),
      ).toThrow(BadRequestException);
    });

    it('allows updateRoleStatus with positive integer version', () => {
      const result = validateUpdateRoleStatus({
        is_active: false,
        version: 2,
      });
      expect(result.version).toBe(2);
    });

    it('throws BadRequestException when replaceRolePermissions has version = 0', () => {
      expect(() =>
        validateReplaceRolePermissions({
          permission_keys: ['identity.roles.read'],
          version: 0,
        }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException when replaceRolePermissions has version < 0', () => {
      expect(() =>
        validateReplaceRolePermissions({
          permission_keys: ['identity.roles.read'],
          version: -2,
        }),
      ).toThrow(BadRequestException);
    });

    it('allows replaceRolePermissions with positive integer version', () => {
      const result = validateReplaceRolePermissions({
        permission_keys: ['identity.roles.read'],
        version: 3,
      });
      expect(result.version).toBe(3);
    });
  });
});
