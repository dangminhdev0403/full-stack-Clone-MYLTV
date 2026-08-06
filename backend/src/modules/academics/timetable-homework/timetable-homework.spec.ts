/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/require-await */
import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { REQUIRED_PERMISSIONS_KEY } from '../../../common/auth/auth.constants';
import { AdminTimetableHomeworkController } from './timetable-homework.controller';
import { TimetableHomeworkService } from './timetable-homework.service';
import {
  validateCreateHomework,
  validateListAdminTimetable,
  validateListHomeworks,
  validateSaveAdminTimetable,
  validateUpdateHomework,
} from './timetable-homework.validation';

describe('Homework administration', () => {
  it('validates class and selected-student targets', () => {
    expect(
      validateCreateHomework({
        target_type: 'class',
        class_id: 'class-1',
        subject: 'Toán',
        title: 'Bài 1',
        content: 'Làm bài 1',
        teacher: 'Cô Mai',
        deadline: '2026-09-20T10:00:00.000Z',
      }).class_id,
    ).toBe('class-1');
    expect(
      validateCreateHomework({
        target_type: 'students',
        student_ids: ['student-1'],
        subject: 'Toán',
        title: 'Bài 1',
        content: 'Làm bài 1',
        teacher: 'Cô Mai',
        deadline: '2026-09-20T10:00:00.000Z',
      }).student_ids,
    ).toEqual(['student-1']);
    expect(() =>
      validateCreateHomework({
        target_type: 'class',
        student_ids: ['student-1'],
        subject: 'Toán',
        title: 'Bài 1',
        content: 'Làm bài 1',
        teacher: 'Cô Mai',
        deadline: 'bad',
      }),
    ).toThrow(BadRequestException);
  });

  it('validates bounded list and non-empty updates', () => {
    expect(validateListHomeworks({ page: '2', page_size: '10' })).toMatchObject(
      { page: 2, page_size: 10 },
    );
    expect(() => validateListHomeworks({ page_size: '101' })).toThrow(
      BadRequestException,
    );
    expect(() => validateUpdateHomework({})).toThrow(BadRequestException);
  });

  it('requires explicit read/manage permissions', () => {
    const permission = (name: keyof AdminTimetableHomeworkController) =>
      Reflect.getMetadata(
        REQUIRED_PERMISSIONS_KEY,
        Object.getOwnPropertyDescriptor(
          AdminTimetableHomeworkController.prototype,
          name,
        )?.value as object,
      ) as string[];
    expect(permission('listHomeworks')).toEqual(['academics.homework.read']);
    expect(permission('getTimetable')).toEqual(['academics.timetable.read']);
    expect(permission('saveTimetable')).toEqual(['academics.timetable.manage']);
    for (const name of [
      'createHomework',
      'updateHomework',
      'archiveHomework',
    ] as const) {
      expect(permission(name)).toEqual(['academics.homework.manage']);
    }
  });

  it('validates timetable scope and rejects duplicate slots', () => {
    expect(
      validateListAdminTimetable({
        class_id: 'class-1',
        semester_id: 'semester-1',
        week_start: '2026-09-07',
      }),
    ).toMatchObject({ class_id: 'class-1', semester_id: 'semester-1' });
    expect(() => validateListAdminTimetable({ class_id: 'class-1' })).toThrow(
      BadRequestException,
    );
    expect(() =>
      validateSaveAdminTimetable({
        class_id: 'class-1',
        semester_id: 'semester-1',
        week_start: '2026-09-07',
        schedules: [
          { day_of_week: 1, period: 1, subject: 'Toán' },
          { day_of_week: 1, period: 1, subject: 'Văn' },
        ],
      }),
    ).toThrow(BadRequestException);
  });

  it('saves one class timetable transactionally and audits the scope', async () => {
    const schoolClass = {
      id: 'class-1',
      displayName: '10A1',
      academicYearId: 'year-1',
      enrollments: [{ studentId: 'student-1' }, { studentId: 'student-2' }],
    };
    const semester = {
      id: 'semester-1',
      academicYearId: 'year-1',
      startsOn: new Date('2026-09-01'),
      endsOn: new Date('2026-12-31'),
    };
    const tx = {
      timetableSchedule: {
        upsert: jest.fn().mockResolvedValue({ id: 'schedule-1' }),
      },
      auditEvent: { create: jest.fn() },
    };
    const prisma = {
      schoolClass: { findUnique: jest.fn().mockResolvedValue(schoolClass) },
      semester: { findUnique: jest.fn().mockResolvedValue(semester) },
      $transaction: jest.fn(async (work: (client: typeof tx) => unknown) =>
        work(tx),
      ),
    };
    const audit = { record: jest.fn().mockResolvedValue(undefined) };
    const service = new TimetableHomeworkService(
      prisma as never,
      audit as never,
    );

    const response = await service.saveTimetable(
      {
        class_id: 'class-1',
        semester_id: 'semester-1',
        week_start: '2026-09-07',
        schedules: [{ day_of_week: 1, period: 1, subject: 'Toán' }],
      },
      { id: 'admin-1', username: 'admin', role: 'admin' },
    );

    expect(tx.timetableSchedule.upsert).toHaveBeenCalledTimes(2);
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        action: 'academics.timetable.save',
        metadata: expect.objectContaining({
          class_id: 'class-1',
          semester_id: 'semester-1',
        }),
      }),
      tx,
    );
    expect(response).toMatchObject({
      success: true,
      data: { class_id: 'class-1', schedules: expect.any(Array) },
    });
  });

  it('creates selected-student homework and audits in one transaction', async () => {
    const created = {
      id: 'homework-1',
      studentId: 'student-1',
      targetType: 'students',
      classId: null,
      studentIds: ['student-1'],
      subjectId: null,
      subject: 'Toán',
      title: 'Bài 1',
      content: 'Làm bài 1',
      teacher: 'Cô Mai',
      assignedAt: new Date('2026-08-06'),
      deadline: new Date('2026-09-20'),
      status: 'pending',
      archivedAt: null,
      createdAt: new Date('2026-08-06'),
      updatedAt: new Date('2026-08-06'),
      submissions: [],
    };
    const tx = {
      homeworkAssignment: { create: jest.fn().mockResolvedValue(created) },
      auditEvent: { create: jest.fn() },
    };
    const prisma = {
      student: { findMany: jest.fn().mockResolvedValue([{ id: 'student-1' }]) },
      $transaction: jest.fn(async (work: (client: typeof tx) => unknown) =>
        work(tx),
      ),
    };
    const audit = { record: jest.fn().mockResolvedValue(undefined) };
    const service = new TimetableHomeworkService(
      prisma as never,
      audit as never,
    );

    await service.createHomework(
      {
        target_type: 'students',
        student_ids: ['student-1'],
        subject: 'Toán',
        title: 'Bài 1',
        content: 'Làm bài 1',
        teacher: 'Cô Mai',
        deadline: '2026-09-20T00:00:00.000Z',
      },
      { id: 'admin-1', username: 'admin', role: 'admin' },
    );

    expect(tx.homeworkAssignment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          studentIds: ['student-1'],
          targetType: 'students',
        }),
      }),
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        action: 'academics.homework.create',
        resourceId: 'homework-1',
      }),
      tx,
    );
  });
});
