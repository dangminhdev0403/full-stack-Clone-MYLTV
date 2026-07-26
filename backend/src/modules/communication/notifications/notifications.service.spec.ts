import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { AuditService } from '../../identity-access/audit/audit.service';
import { NotificationsService } from './notifications.service';

describe('NotificationsService admin', () => {
  it('lists filtered notifications with standard envelope pagination', async () => {
    const { service, prisma } = setup();
    prisma.notification.findMany.mockResolvedValue([record()]);
    prisma.notification.count.mockResolvedValue(21);

    const result = await service.listAdminNotifications({
      page: 2,
      page_size: 10,
      q: 'hoc',
      tag: 'Hoc tap',
    });

    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tag: 'Hoc tap',
          OR: [
            { title: { contains: 'hoc', mode: 'insensitive' } },
            { content: { contains: 'hoc', mode: 'insensitive' } },
          ],
        },
        skip: 10,
        take: 10,
      }),
    );
    expect(result.success).toBe(true);
    expect(result.data.total).toBe(21);
    expect(result.data.has_next).toBe(true);
  });

  it('returns detail and rejects a missing notification', async () => {
    const { service, prisma } = setup();
    prisma.notification.findUnique.mockResolvedValue(record());
    await expect(
      service.getAdminNotification('notification-1'),
    ).resolves.toEqual(expect.objectContaining({ success: true }));
    prisma.notification.findUnique.mockResolvedValue(null);
    await expect(
      service.getAdminNotification('missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates and updates persisted notifications with audit records', async () => {
    const { service, prisma, audit } = setup();
    prisma.notification.create.mockResolvedValue(record());
    prisma.notification.findUnique.mockResolvedValue(record());
    prisma.notification.update.mockResolvedValue(record({ title: 'Cap nhat' }));

    await service.createNotification(
      { title: 'Thong bao', sender: 'BGH', content: 'Noi dung' },
      actor(),
    );
    const result = await service.updateAdminNotification(
      'notification-1',
      { title: 'Cap nhat' },
      actor(),
    );

    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'communication.notifications.create' }),
      prisma,
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'communication.notifications.update' }),
      prisma,
    );
    expect(result.data.title).toBe('Cap nhat');
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
  });

  it('uses only the authenticated active student for app read state', async () => {
    const { service, prisma } = setup();
    prisma.notification.findMany.mockResolvedValue([record()]);
    prisma.notification.count.mockResolvedValue(1);
    prisma.notification.findUnique.mockResolvedValue(record());
    prisma.notificationRead.findFirst.mockResolvedValue(null);
    const user = {
      ...actor(),
      role: 'parent' as const,
      activeStudentId: 'student-1',
    };

    await service.listNotifications({ page: 1, page_size: 20 }, user);
    await service.getNotificationDetail('notification-1', user);
    await service.markAsRead('notification-1', user);

    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          reads: {
            where: { accountId: 'admin-1', studentId: 'student-1' },
          },
        },
      }),
    );
    expect(prisma.notificationRead.upsert).toHaveBeenCalledWith({
      where: {
        notificationId_studentId_accountId: {
          notificationId: 'notification-1',
          studentId: 'student-1',
          accountId: 'admin-1',
        },
      },
      create: {
        notificationId: 'notification-1',
        studentId: 'student-1',
        accountId: 'admin-1',
      },
      update: {},
    });
  });

  it('rejects app access without an active student', async () => {
    const { service } = setup();
    await expect(
      service.listNotifications(
        {},
        {
          ...actor(),
          role: 'parent',
          activeStudentId: null,
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects mutation without an admin actor', async () => {
    const { service } = setup();
    await expect(
      service.createNotification(
        { title: 'T', sender: 'S', content: 'C' },
        undefined,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

function setup() {
  const transaction = jest.fn();
  const prisma = {
    $transaction: transaction,
    auditEvent: { create: jest.fn() },
    notification: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    notificationRead: { findFirst: jest.fn(), upsert: jest.fn() },
  };
  transaction.mockImplementation((callback: (tx: typeof prisma) => unknown) =>
    Promise.resolve(callback(prisma)),
  );
  const audit = { record: jest.fn() };
  return {
    service: new NotificationsService(
      prisma as never,
      audit as unknown as AuditService,
    ),
    prisma,
    audit,
  };
}

function actor() {
  return { id: 'admin-1', username: 'admin', role: 'admin' as const };
}
function record(overrides: Record<string, unknown> = {}) {
  const now = new Date('2026-07-26T00:00:00.000Z');
  return {
    id: 'notification-1',
    title: 'Thong bao',
    sender: 'BGH',
    sentAt: now,
    content: 'Noi dung',
    tag: 'Quan trong',
    createdById: 'admin-1',
    createdAt: now,
    updatedAt: now,
    reads: [],
    ...overrides,
  };
}
