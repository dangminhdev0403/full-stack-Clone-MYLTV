import { Reflector } from '@nestjs/core';
import { REQUIRED_PERMISSIONS_KEY } from '../../common/auth/auth.constants';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { UserManagementController } from './user-management.controller';
import { UserManagementService } from './user-management.service';
import type { UserDetailDto } from './dto/user-management.dto';

describe('UserManagementController', () => {
  const service = {
    listUsers: jest.fn(),
    getUser: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    disableUser: jest.fn(),
    resetPassword: jest.fn(),
  } as unknown as jest.Mocked<UserManagementService>;
  const controller = new UserManagementController(service);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires users.manage permission on every route handler', () => {
    const reflector = new Reflector();

    for (const methodName of [
      'listUsers',
      'getUser',
      'createUser',
      'updateUser',
      'disableUser',
      'resetPassword',
    ] as const) {
      const permissions = reflector.get<string[]>(
        REQUIRED_PERMISSIONS_KEY,
        controller[methodName],
      );
      expect(permissions).toEqual(['users.manage']);
    }
  });

  it('rejects invalid query and mutation payloads before calling the service', () => {
    expect(() => controller.listUsers({ page: 0 })).toThrow(
      'Invalid request payload',
    );
    expect(() =>
      controller.createUser(
        {
          username: '',
          display_name: '',
          role: 'admin',
          password: 'short',
          permission_keys: [],
        },
        authenticatedUser(),
      ),
    ).toThrow('Invalid request payload');
    expect(() =>
      controller.updateUser('account-1', {}, authenticatedUser()),
    ).toThrow('Invalid request payload');
    expect(() =>
      controller.resetPassword(
        'account-1',
        { password: 'short' },
        authenticatedUser(),
      ),
    ).toThrow('Invalid request payload');

    expect(service.listUsers.mock.calls).toHaveLength(0);
    expect(service.createUser.mock.calls).toHaveLength(0);
    expect(service.updateUser.mock.calls).toHaveLength(0);
    expect(service.resetPassword.mock.calls).toHaveLength(0);
  });

  it('delegates user management requests to the service', async () => {
    const actor = authenticatedUser();
    service.listUsers.mockResolvedValue(
      success({ items: [], page: 1, page_size: 20, total: 0 }),
    );
    service.getUser.mockResolvedValue(success(userDetail()));
    service.createUser.mockResolvedValue(success(userDetail()));
    service.updateUser.mockResolvedValue(success(userDetail()));
    service.disableUser.mockResolvedValue(success({ disabled: true }));
    service.resetPassword.mockResolvedValue(success({ reset: true }));

    await controller.listUsers({ q: 'adm' });
    await controller.getUser('account-1');
    await controller.createUser(
      {
        username: 'new-admin',
        display_name: 'New Admin',
        role: 'admin',
        password: 'secret-password',
        permission_keys: ['users.manage'],
      },
      actor,
    );
    await controller.updateUser('account-1', { is_active: false }, actor);
    await controller.disableUser('account-1', actor);
    await controller.resetPassword(
      'account-1',
      { password: 'new-password' },
      actor,
    );

    expect(service.listUsers.mock.calls[0]?.[0]).toEqual({ q: 'adm' });
    expect(service.getUser.mock.calls[0]?.[0]).toBe('account-1');
    expect(service.createUser.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ username: 'new-admin' }),
    );
    expect(service.updateUser.mock.calls[0]).toEqual([
      'account-1',
      { is_active: false },
      actor,
    ]);
    expect(service.disableUser.mock.calls[0]).toEqual(['account-1', actor]);
    expect(service.resetPassword.mock.calls[0]).toEqual([
      'account-1',
      {
        password: 'new-password',
      },
      actor,
    ]);
  });
});

function authenticatedUser(): AuthenticatedUser {
  return { id: 'actor-1', username: 'root', role: 'super_admin' };
}

function userDetail(): UserDetailDto {
  return {
    id: 'account-1',
    username: 'admin',
    display_name: 'Admin',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    permission_keys: ['users.manage'],
  };
}

function success<T>(data: T) {
  return { success: true as const, data };
}
