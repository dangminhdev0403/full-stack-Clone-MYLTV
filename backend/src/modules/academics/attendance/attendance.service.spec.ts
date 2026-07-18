/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/require-await */
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import type { AuditService } from '../../identity-access/audit/audit.service';
import { AttendanceService } from './attendance.service';

const actor: AuthenticatedUser = {
  id: 'admin-1',
  username: 'admin',
  role: 'admin',
};

describe('AttendanceService', () => {
  it('lists one class attendance session with student summaries and counts', async () => {
    const { service, prisma } = setup();
    prisma.attendanceSession.findMany.mockResolvedValue([sessionRecord()]);
    prisma.attendanceSession.count.mockResolvedValue(1);

    const result = await service.listSessions({
      date: '2026-07-18',
      class_name: '6A1',
      period: 'afternoon',
      page: 1,
      page_size: 20,
    });

    expect(prisma.attendanceSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          attendanceDate: new Date('2026-07-18T00:00:00.000Z'),
          className: '6A1',
          period: 'afternoon',
        },
      }),
    );
    expect(result.data.items[0]).toEqual(
      expect.objectContaining({
        id: 'session-1',
        date: '2026-07-18',
        class_name: '6A1',
        counts: { present: 1, absent: 0, late: 1, excused: 0 },
      }),
    );
    expect(result.data.items[0].records[0]).toEqual(
      expect.objectContaining({ student_code: 'UAT-HS-001' }),
    );
  });

  it('creates a session transactionally from explicit records and audits it', async () => {
    const { service, prisma, audit } = setup();
    prisma.semester.findFirst.mockResolvedValue({ id: 'semester-1' });
    prisma.student.findMany.mockResolvedValue([
      { id: 'student-1', className: '6A1', isActive: true },
      { id: 'student-2', className: '6A1', isActive: true },
    ]);
    prisma.attendanceSession.create.mockResolvedValue({ id: 'session-1' });
    prisma.attendanceSession.findUnique.mockResolvedValue(sessionRecord());

    const result = await service.createSession(
      {
        date: '2026-07-18',
        class_name: '6A1',
        period: 'morning',
        records: [
          { student_id: 'student-1', status: 'present', note: null },
          { student_id: 'student-2', status: 'late', note: 'Đến muộn 5 phút' },
        ],
      },
      actor,
    );

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.attendanceSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          semesterId: 'semester-1',
          className: '6A1',
          period: 'morning',
          createdById: 'admin-1',
          records: {
            create: expect.arrayContaining([
              expect.objectContaining({
                studentId: 'student-1',
                status: 'present',
              }),
            ]),
          },
        }),
      }),
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'academics.attendance.create' }),
    );
    expect(result.data.id).toBe('session-1');
  });

  it('rejects duplicate students, students outside the class, and duplicate sessions', async () => {
    const { service, prisma } = setup();
    await expect(
      service.createSession(
        {
          date: '2026-07-18',
          class_name: '6A1',
          period: 'morning',
          records: [
            { student_id: 'student-1', status: 'present', note: null },
            { student_id: 'student-1', status: 'late', note: null },
          ],
        },
        actor,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    prisma.semester.findFirst.mockResolvedValue({ id: 'semester-1' });
    prisma.student.findMany.mockResolvedValue([]);
    await expect(
      service.createSession(
        {
          date: '2026-07-18',
          class_name: '6A1',
          period: 'morning',
          records: [{ student_id: 'student-1', status: 'present', note: null }],
        },
        actor,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    prisma.student.findMany.mockResolvedValue([
      { id: 'student-1', className: '6A1', isActive: true },
    ]);
    prisma.attendanceSession.create.mockRejectedValue({ code: 'P2002' });
    await expect(
      service.createSession(
        {
          date: '2026-07-18',
          class_name: '6A1',
          period: 'morning',
          records: [{ student_id: 'student-1', status: 'present', note: null }],
        },
        actor,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('replaces all records in one transaction and audits the update', async () => {
    const { service, prisma, audit } = setup();
    prisma.attendanceSession.findUnique
      .mockResolvedValueOnce({ id: 'session-1', className: '6A1' })
      .mockResolvedValueOnce(
        sessionRecord({ records: [record({ status: 'excused' })] }),
      );
    prisma.student.findMany.mockResolvedValue([
      { id: 'student-1', className: '6A1', isActive: true },
    ]);

    const result = await service.updateSession(
      'session-1',
      {
        records: [
          {
            student_id: 'student-1',
            status: 'excused',
            note: 'Có đơn xin phép',
          },
        ],
      },
      actor,
    );

    expect(prisma.attendanceRecord.deleteMany).toHaveBeenCalledWith({
      where: { sessionId: 'session-1' },
    });
    expect(prisma.attendanceRecord.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({ sessionId: 'session-1', status: 'excused' }),
      ],
    });
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'academics.attendance.update' }),
    );
    expect(result.data.records[0].status).toBe('excused');
  });

  it('returns not found for an unknown session', async () => {
    const { service, prisma } = setup();
    prisma.attendanceSession.findUnique.mockResolvedValue(null);
    await expect(service.getSession('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

function setup() {
  const prisma = {
    $transaction: jest.fn(async (callback: (tx: unknown) => unknown) =>
      callback(prisma),
    ),
    semester: { findFirst: jest.fn() },
    student: { findMany: jest.fn() },
    attendanceSession: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    attendanceRecord: { deleteMany: jest.fn(), createMany: jest.fn() },
  };
  const audit = { record: jest.fn() };
  const service = new AttendanceService(
    prisma as never,
    audit as unknown as AuditService,
  );
  return { service, prisma, audit };
}

function sessionRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'session-1',
    attendanceDate: new Date('2026-07-18T00:00:00.000Z'),
    period: 'morning',
    className: '6A1',
    semesterId: 'semester-1',
    createdById: 'admin-1',
    createdAt: new Date('2026-07-18T01:00:00.000Z'),
    updatedAt: new Date('2026-07-18T01:00:00.000Z'),
    records: [
      record(),
      record({
        id: 'record-2',
        studentId: 'student-2',
        status: 'late',
        student: {
          id: 'student-2',
          code: 'UAT-HS-002',
          fullName: 'Trần Gia Bảo',
          avatarUrl: null,
          grade: '6',
          className: '6A1',
        },
      }),
    ],
    ...overrides,
  };
}

function record(overrides: Record<string, unknown> = {}) {
  return {
    id: 'record-1',
    sessionId: 'session-1',
    studentId: 'student-1',
    status: 'present',
    note: null,
    markedById: 'admin-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    student: {
      id: 'student-1',
      code: 'UAT-HS-001',
      fullName: 'Nguyễn Minh Anh',
      avatarUrl: null,
      grade: '6',
      className: '6A1',
    },
    ...overrides,
  };
}
