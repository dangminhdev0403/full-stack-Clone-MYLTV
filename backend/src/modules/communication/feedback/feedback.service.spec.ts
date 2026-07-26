import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { AuditService } from '../../identity-access/audit/audit.service';
import { FeedbackService } from './feedback.service';

describe('FeedbackService admin', () => {
  it('lists filtered feedback with pagination envelope', async () => {
    const { service, prisma } = setup();
    prisma.feedbackItem.findMany.mockResolvedValue([record()]);
    prisma.feedbackItem.count.mockResolvedValue(21);
    const result = await service.list({
      page: 2,
      page_size: 10,
      q: 'hoc',
      status: 'new',
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.feedbackItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
    expect(result.data.total).toBe(21);
    expect(result.data.has_next).toBe(true);
  });

  it('returns detail or 404', async () => {
    const { service, prisma } = setup();
    prisma.feedbackItem.findUnique.mockResolvedValue(record());
    await expect(service.detail('feedback-1')).resolves.toEqual(
      expect.objectContaining({ success: true }),
    );
    prisma.feedbackItem.findUnique.mockResolvedValue(null);
    await expect(service.detail('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates status and audit atomically', async () => {
    const { service, prisma, audit } = setup();
    prisma.feedbackItem.findUnique.mockResolvedValue(record());
    prisma.feedbackItem.update.mockResolvedValue(
      record({ status: 'resolved' }),
    );
    const result = await service.updateStatus(
      'feedback-1',
      { status: 'resolved' },
      actor(),
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'communication.feedback.update_status',
      }),
      prisma,
    );
    expect(result.data.status).toBe('resolved');
  });

  it('maps a concurrent-delete P2025 update race to 404', async () => {
    const { service, prisma } = setup();
    prisma.feedbackItem.findUnique.mockResolvedValue(record());
    prisma.feedbackItem.update.mockRejectedValue({ code: 'P2025' });

    await expect(
      service.updateStatus('feedback-1', { status: 'resolved' }, actor()),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects mutation without admin actor', async () => {
    const { service } = setup();
    await expect(
      service.updateStatus('feedback-1', { status: 'resolved' }, undefined),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

function setup() {
  const transaction = jest.fn();
  const prisma = {
    $transaction: transaction,
    auditEvent: { create: jest.fn() },
    feedbackItem: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  transaction.mockImplementation(
    (operation: ((tx: typeof prisma) => unknown) | Promise<unknown>[]) =>
      Array.isArray(operation)
        ? Promise.all(operation)
        : Promise.resolve(operation(prisma)),
  );
  const audit = { record: jest.fn() };
  return {
    service: new FeedbackService(
      prisma as never,
      audit as unknown as AuditService,
    ),
    prisma,
    audit,
  };
}
const actor = () => ({
  id: 'admin-1',
  username: 'admin',
  role: 'admin' as const,
});
function record(overrides: Record<string, unknown> = {}) {
  const now = new Date('2026-07-26T00:00:00.000Z');
  return {
    id: 'feedback-1',
    studentId: 'student-1',
    accountId: 'parent-1',
    title: 'Hoc tap',
    content: 'Noi dung',
    category: 'hoc_tap',
    status: 'new',
    attachmentsJson: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
