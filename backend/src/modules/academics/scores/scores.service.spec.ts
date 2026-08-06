/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/require-await */
import { BadRequestException } from '@nestjs/common';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import type { AuditService } from '../../identity-access/audit/audit.service';
import { ScoresService } from './scores.service';

const actor: AuthenticatedUser = {
  id: 'admin-1',
  username: 'admin_user',
  role: 'admin',
};

describe('ScoresService', () => {
  it('lists scores with filters and pagination envelope without fabricated fallbacks', async () => {
    const { service, prisma } = setup();

    prisma.student.findMany.mockResolvedValue([
      {
        id: 'student-1',
        code: 'HS001',
        fullName: 'Nguyen Van A',
        className: '10A1',
      },
    ]);
    prisma.studentScoreRecord.findMany.mockResolvedValue([
      scoreRecord({
        studentId: 'student-1',
        oralScoresJson: [9, 10],
        fifteenMinScoresJson: [8.5],
        midtermScore: 8,
        finalScore: 9,
        averageScore: 8.8,
        teacherComment: 'Good progress',
      }),
    ]);
    prisma.studentScoreRecord.count.mockResolvedValue(1);

    const result = await service.listScores({
      student_id: 'student-1',
      class_name: '10A1',
      school_year: '2026-2027',
      semester_code: '1',
      subject_id: 'toan-hoc',
      page: 1,
      page_size: 20,
    });

    expect(result.success).toBe(true);
    expect(result.data.page).toBe(1);
    expect(result.data.total).toBe(1);
    expect(result.data.items[0]).toEqual(
      expect.objectContaining({
        student_id: 'student-1',
        student_code: 'HS001',
        student_name: 'Nguyen Van A',
        class_name: '10A1',
        school_year: '2026-2027',
        semester_code: '1',
        subject_id: 'toan-hoc',
        subject_name: 'Toán Học',
        oral_scores: [9, 10],
        fifteen_minute_scores: [8.5],
        midterm_score: 8,
        final_score: 9,
        average_score: 8.8,
        teacher_comment: 'Good progress',
      }),
    );
  });

  it('getStudentScores returns persisted facts only without fabricated defaults', async () => {
    const { service, prisma } = setup();

    prisma.studentScoreRecord.findMany.mockResolvedValue([
      scoreRecord({
        studentId: 'student-1',
        oralScoresJson: [],
        fifteenMinScoresJson: [],
        midtermScore: null,
        finalScore: null,
        averageScore: null,
        teacherComment: null,
      }),
    ]);

    const result = await service.getStudentScores(
      'student-1',
      '2026-2027',
      '1',
    );

    expect(result.success).toBe(true);
    expect(result.data.subjects[0]).toEqual(
      expect.objectContaining({
        subject_id: 'toan-hoc',
        subject_name: 'Toán Học',
        oral_scores: [],
        fifteen_minute_scores: [],
        midterm_score: null,
        final_score: null,
        average_score: null,
        classification: null,
        teacher_comment: null,
      }),
    );
    expect(result.data.subjects[0]).not.toHaveProperty('teacher_name');
  });

  it('getRewardDiscipline returns persisted facts only without fabricated defaults', async () => {
    const { service, prisma } = setup();

    prisma.rewardDisciplineRecord.findMany.mockResolvedValue([
      {
        id: 'rd-1',
        studentId: 'student-1',
        semesterId: 'sem-1',
        schoolYear: '2026-2027',
        type: 'reward',
        title: 'Học sinh giỏi',
        content: 'Đạt thành tích xuất sắc',
        date: new Date('2026-08-01'),
        issuer: null,
        createdAt: new Date('2026-08-01'),
      },
    ]);

    const result = await service.getRewardDiscipline('student-1');

    expect(result.success).toBe(true);
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        id: 'rd-1',
        type: 'reward',
        title: 'Học sinh giỏi',
        recorded_by_name: null,
        points: null,
      }),
    );
  });

  it('saveScoreRecord fails closed when actor is missing', async () => {
    const { service } = setup();

    await expect(
      service.saveScoreRecord({
        student_id: 'student-1',
        subject_id: 'toan-hoc',
        subject_name: 'Toán Học',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('saveScoreRecord throws 400 when student is missing or inactive', async () => {
    const { service, prisma } = setup();

    prisma.student.findUnique.mockResolvedValue(null);

    await expect(
      service.saveScoreRecord(
        {
          student_id: 'non-existent',
          subject_id: 'toan-hoc',
          subject_name: 'Toán Học',
        },
        actor,
      ),
    ).rejects.toThrow(BadRequestException);

    prisma.student.findUnique.mockResolvedValue({
      id: 'student-1',
      isActive: false,
    });

    await expect(
      service.saveScoreRecord(
        {
          student_id: 'student-1',
          subject_id: 'toan-hoc',
          subject_name: 'Toán Học',
        },
        actor,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('saveScoreRecord throws 400 when semester is missing or metadata is incoherent', async () => {
    const { service, prisma } = setup();

    prisma.student.findUnique.mockResolvedValue({
      id: 'student-1',
      isActive: true,
    });
    prisma.semester.findUnique.mockResolvedValue(null);

    await expect(
      service.saveScoreRecord(
        {
          student_id: 'student-1',
          semester_id: 'invalid-sem',
          subject_id: 'toan-hoc',
          subject_name: 'Toán Học',
        },
        actor,
      ),
    ).rejects.toThrow(BadRequestException);

    prisma.semester.findUnique.mockResolvedValue({
      id: 'sem-1',
      code: '1',
      academicYear: { code: '2026-2027' },
    });

    await expect(
      service.saveScoreRecord(
        {
          student_id: 'student-1',
          semester_id: 'sem-1',
          school_year: '2025-2026', // incoherent
          subject_id: 'toan-hoc',
          subject_name: 'Toán Học',
        },
        actor,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('saveScoreRecord upserts transactionally and records audit event in the same transaction', async () => {
    const { service, prisma, audit } = setup();

    prisma.student.findUnique.mockResolvedValue({
      id: 'student-1',
      isActive: true,
    });
    prisma.semester.findUnique.mockResolvedValue({
      id: 'sem-1',
      code: '1',
      academicYear: { code: '2026-2027' },
    });
    prisma.studentScoreRecord.upsert.mockResolvedValue(
      scoreRecord({
        studentId: 'student-1',
        semesterId: 'sem-1',
        schoolYear: '2026-2027',
        semesterCode: '1',
        oralScoresJson: [8, 9],
        fifteenMinScoresJson: [8.5],
        midtermScore: 8,
        finalScore: 9,
        averageScore: 8.6,
      }),
    );

    const result = await service.saveScoreRecord(
      {
        student_id: 'student-1',
        semester_id: 'sem-1',
        school_year: '2026-2027',
        semester_code: '1',
        subject_id: 'toan-hoc',
        subject_name: 'Toán Học',
        oral_scores: [8, 9],
        fifteen_min_scores: [8.5],
        midterm_score: 8,
        final_score: 9,
      },
      actor,
    );

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.studentScoreRecord.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          studentId_semesterId_subjectId: {
            studentId: 'student-1',
            semesterId: 'sem-1',
            subjectId: 'toan-hoc',
          },
        },
      }),
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        action: 'academics.scores.save',
        boundedContext: 'Academics',
        resourceType: 'StudentScoreRecord',
      }),
      expect.anything(),
    );
    expect(result.data.student_id).toBe('student-1');
  });

  it('saveRewardDisciplineRecord creates transactionally and audits event', async () => {
    const { service, prisma, audit } = setup();

    prisma.student.findUnique.mockResolvedValue({
      id: 'student-1',
      isActive: true,
    });
    prisma.semester.findUnique.mockResolvedValue({
      id: 'sem-1',
      code: '1',
      academicYear: { code: '2026-2027' },
    });
    prisma.rewardDisciplineRecord.create.mockResolvedValue({
      id: 'rd-1',
      studentId: 'student-1',
      semesterId: 'sem-1',
      schoolYear: '2026-2027',
      type: 'reward',
      title: 'Học sinh giỏi',
      content: 'Thành tích xuất sắc',
      date: new Date('2026-08-01'),
      issuer: 'admin_user',
      createdAt: new Date('2026-08-01'),
    });

    const result = await service.saveRewardDisciplineRecord(
      {
        student_id: 'student-1',
        semester_id: 'sem-1',
        school_year: '2026-2027',
        type: 'reward',
        title: 'Học sinh giỏi',
        content: 'Thành tích xuất sắc',
        date: '2026-08-01',
      },
      actor,
    );

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.rewardDisciplineRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          studentId: 'student-1',
          type: 'reward',
          title: 'Học sinh giỏi',
        }),
      }),
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        action: 'academics.scores.save_reward_discipline',
      }),
      expect.anything(),
    );
    expect(result.data.id).toBe('rd-1');
  });
});

function setup() {
  const prisma = {
    $transaction: jest.fn(async (callback: (tx: unknown) => unknown) =>
      callback(prisma),
    ),
    student: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    semester: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    studentScoreRecord: {
      findMany: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
    rewardDisciplineRecord: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };
  const audit = { record: jest.fn() };
  const service = new ScoresService(
    prisma as never,
    audit as unknown as AuditService,
  );
  return { service, prisma, audit };
}

function scoreRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 's-1',
    studentId: 'student-1',
    semesterId: 'sem-1',
    schoolYear: '2026-2027',
    semesterCode: '1',
    subjectId: 'toan-hoc',
    subjectName: 'Toán Học',
    oralScoresJson: [8, 9],
    fifteenMinScoresJson: [8.5],
    midtermScore: 8,
    finalScore: 9,
    averageScore: 8.6,
    teacherComment: 'Tiến bộ tốt',
    createdAt: new Date('2026-08-01T00:00:00Z'),
    updatedAt: new Date('2026-08-01T00:00:00Z'),
    ...overrides,
  };
}
