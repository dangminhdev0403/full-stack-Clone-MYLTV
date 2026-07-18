/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { AuditService } from '../../identity-access/audit/audit.service';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import type { PrismaService } from '../../../prisma/prisma.service';
import { TuitionService } from './tuition.service';

const actor: AuthenticatedUser = {
  id: 'admin-1',
  username: 'admin',
  role: 'admin' as const,
  permissions: ['billing.tuition.manage'],
  activeStudentId: null,
};

describe('TuitionService', () => {
  it('lists filtered charges with server-derived totals and statuses', async () => {
    const { service, prisma } = setup();
    prisma.tuitionCharge.findMany.mockResolvedValue([
      charge({
        amountDue: 10_000_000,
        amountPaid: 4_000_000,
        status: 'partial',
      }),
      charge({
        id: 'charge-2',
        amountDue: 5_000_000,
        amountPaid: 5_000_000,
        status: 'paid',
      }),
    ]);
    prisma.tuitionCharge.count.mockResolvedValue(2);
    prisma.tuitionCharge.aggregate.mockResolvedValue({
      _sum: { amountDue: 15_000_000, amountPaid: 9_000_000 },
    });

    const result = await service.listCharges({
      class_name: '6A1',
      semester_id: 'semester-1',
      status: 'partial',
      page: 1,
      page_size: 20,
    });

    expect(prisma.tuitionCharge.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          semesterId: 'semester-1',
          student: { className: '6A1' },
          status: 'partial',
        }),
      }),
    );
    expect(result.data.summary).toEqual({
      amount_due: 15_000_000,
      amount_paid: 9_000_000,
      amount_outstanding: 6_000_000,
    });
    expect(prisma.tuitionCharge.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([{ isWaived: false }]),
        }),
      }),
    );
    expect(result.data.items.map((item) => item.status)).toEqual([
      'partial',
      'paid',
    ]);
  });

  it('creates an active-student charge transactionally and audits it', async () => {
    const { service, prisma, tx, audit } = setup();
    tx.student.findUnique.mockResolvedValue({
      id: 'student-1',
      isActive: true,
    });
    tx.semester.findUnique.mockResolvedValue({ id: 'semester-1' });
    tx.tuitionCharge.create.mockResolvedValue(charge());

    const result = await service.createCharge(
      {
        student_id: 'student-1',
        semester_id: 'semester-1',
        title: 'Học phí học kỳ 1',
        amount_due: 10_000_000,
        amount_paid: 0,
        due_date: '2026-09-15',
        note: null,
        is_waived: false,
      },
      actor,
    );

    expect(prisma.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ isolationLevel: 'Serializable' }),
    );
    expect(result.data.status).toBe('unpaid');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'billing.tuition.create' }),
    );
  });

  it('updates amounts and derives paid/waived state without client status input', async () => {
    const { service, tx, audit } = setup();
    tx.tuitionCharge.findUnique.mockResolvedValue(charge());
    tx.tuitionCharge.update.mockResolvedValue(
      charge({ amountPaid: 10_000_000, isWaived: false, status: 'paid' }),
    );

    const result = await service.updateCharge(
      'charge-1',
      { amount_paid: 10_000_000 },
      actor,
    );

    expect(result.data.status).toBe('paid');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'billing.tuition.update' }),
    );
  });

  it('reports zero outstanding amount for waived charges', async () => {
    const { service, tx } = setup();
    tx.tuitionCharge.findUnique.mockResolvedValue(charge());
    tx.tuitionCharge.update.mockResolvedValue(
      charge({ amountPaid: 0, isWaived: true, status: 'waived' }),
    );

    const result = await service.updateCharge(
      'charge-1',
      { is_waived: true },
      actor,
    );

    expect(result.data).toMatchObject({
      status: 'waived',
      amount_paid: 0,
      amount_outstanding: 0,
    });
  });

  it('rejects inactive students, unknown records and duplicate charges', async () => {
    const { service, prisma, tx } = setup();
    tx.student.findUnique.mockResolvedValue({
      id: 'student-1',
      isActive: false,
    });
    tx.semester.findUnique.mockResolvedValue({ id: 'semester-1' });
    await expect(
      service.createCharge(
        {
          student_id: 'student-1',
          semester_id: 'semester-1',
          title: 'Học phí',
          amount_due: 10,
          amount_paid: 0,
          due_date: null,
          note: null,
          is_waived: false,
        },
        actor,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    tx.tuitionCharge.findUnique.mockResolvedValue(null);
    await expect(
      service.updateCharge('missing', { amount_paid: 1 }, actor),
    ).rejects.toBeInstanceOf(NotFoundException);

    prisma.$transaction.mockRejectedValueOnce({ code: 'P2002' });
    await expect(
      service.createCharge(
        {
          student_id: 'student-1',
          semester_id: 'semester-1',
          title: 'Học phí',
          amount_due: 10,
          amount_paid: 0,
          due_date: null,
          note: null,
          is_waived: false,
        },
        actor,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

function setup() {
  const tx = {
    student: { findUnique: jest.fn() },
    semester: { findUnique: jest.fn() },
    tuitionCharge: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const prisma = {
    tuitionCharge: {
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      fields: { amountDue: Symbol('amountDue') },
    },
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
  };
  const audit = { record: jest.fn() };
  return {
    service: new TuitionService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditService,
    ),
    prisma,
    tx,
    audit,
  };
}

function charge(overrides: Record<string, unknown> = {}) {
  return {
    id: 'charge-1',
    studentId: 'student-1',
    semesterId: 'semester-1',
    title: 'Học phí học kỳ 1',
    amountDue: 10_000_000,
    amountPaid: 0,
    status: 'unpaid',
    dueDate: new Date('2026-09-15T00:00:00.000Z'),
    note: null,
    isWaived: false,
    createdAt: new Date('2026-07-18T00:00:00.000Z'),
    updatedAt: new Date('2026-07-18T00:00:00.000Z'),
    student: {
      id: 'student-1',
      code: 'UAT-HS-001',
      fullName: 'Nguyễn Minh Anh',
      className: '6A1',
      grade: '6',
    },
    semester: {
      id: 'semester-1',
      code: '1',
      displayName: 'Học kỳ 1',
      academicYear: {
        id: 'year-1',
        code: '2026-2027',
        displayName: '2026-2027',
      },
    },
    ...overrides,
  };
}
