import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import {
  REQUIRED_PERMISSIONS_KEY,
  REQUIRED_ROLES_KEY,
} from '../../../common/auth/auth.constants';
import {
  AdminNotificationsController,
  AppNotificationsController,
} from './notifications.controller';
import type { NotificationsService } from './notifications.service';

describe('AdminNotificationsController', () => {
  it('declares read/manage permissions and delegates validated admin routes', async () => {
    const service = serviceMock();
    const controller = new AdminNotificationsController(
      service as unknown as NotificationsService,
    );

    await controller.list({
      page: '2',
      page_size: '10',
      q: 'hoc',
      tag: 'Hoc tap',
    });
    await controller.detail('notification-1');
    await controller.create(
      { title: 'Thong bao', sender: 'BGH', content: 'Noi dung' },
      actor(),
    );
    await controller.update('notification-1', { title: 'Cap nhat' }, actor());

    expect(service.listAdminNotifications).toHaveBeenCalledWith({
      page: 2,
      page_size: 10,
      q: 'hoc',
      tag: 'Hoc tap',
    });
    expect(service.getAdminNotification).toHaveBeenCalledWith('notification-1');
    expect(service.updateAdminNotification).toHaveBeenCalledWith(
      'notification-1',
      { title: 'Cap nhat' },
      actor(),
    );

    const list = Object.getOwnPropertyDescriptor(
      AdminNotificationsController.prototype,
      'list',
    )?.value as unknown;
    const create = Object.getOwnPropertyDescriptor(
      AdminNotificationsController.prototype,
      'create',
    )?.value as unknown;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, list)).toEqual([
      'communication.notifications.read',
    ]);
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, create)).toEqual([
      'communication.notifications.manage',
    ]);
    expect(
      Reflect.getMetadata(REQUIRED_ROLES_KEY, AdminNotificationsController),
    ).toEqual(['admin', 'super_admin']);
  });

  it('rejects invalid list, create and empty update payloads', () => {
    const service = serviceMock();
    const controller = new AdminNotificationsController(
      service as unknown as NotificationsService,
    );

    expect(() => controller.list({ page_size: '101' })).toThrow(
      BadRequestException,
    );
    expect(() =>
      controller.create({ title: '', sender: '', content: '' }, actor()),
    ).toThrow(BadRequestException);
    expect(() => controller.update('notification-1', {}, actor())).toThrow(
      BadRequestException,
    );
    expect(service.createNotification).not.toHaveBeenCalled();
    expect(service.updateAdminNotification).not.toHaveBeenCalled();
  });
});

describe('AppNotificationsController', () => {
  it('validates list input and derives student scope only from the actor', async () => {
    const service = serviceMock();
    const controller = new AppNotificationsController(
      service as unknown as NotificationsService,
    );
    const user = {
      ...actor(),
      role: 'parent' as const,
      activeStudentId: 'student-1',
    };

    await controller.list({ page: '2', page_size: '10', q: ' hoc ' }, user);
    await controller.markRead('notification-1', user);

    expect(service.listNotifications).toHaveBeenCalledWith(
      { page: 2, page_size: 10, q: 'hoc' },
      user,
    );
    expect(service.markAsRead).toHaveBeenCalledWith('notification-1', user);
    expect(() => controller.list({ page_size: '101' }, user)).toThrow(
      BadRequestException,
    );
  });
});

function serviceMock() {
  return {
    listAdminNotifications: jest.fn(),
    getAdminNotification: jest.fn(),
    createNotification: jest.fn(),
    updateAdminNotification: jest.fn(),
    listNotifications: jest.fn(),
    markAsRead: jest.fn(),
  };
}

function actor() {
  return { id: 'admin-1', username: 'admin', role: 'admin' as const };
}
