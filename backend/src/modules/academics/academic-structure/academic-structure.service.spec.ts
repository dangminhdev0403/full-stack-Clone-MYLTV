import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import type { AuditService } from '../../identity-access/audit/audit.service';
import { AcademicStructureService } from './academic-structure.service';

type MockFn = jest.Mock;

interface MockGradeLevelDelegate {
  findMany: MockFn;
  findUnique: MockFn;
  create: MockFn;
  update: MockFn;
}

interface MockSchoolClassDelegate {
  findMany: MockFn;
  findUnique: MockFn;
  create: MockFn;
  update: MockFn;
}

interface MockClassEnrollmentDelegate {
  findMany: MockFn;
  findFirst: MockFn;
  create: MockFn;
  update: MockFn;
  updateMany: MockFn;
}

interface MockAcademicYearDelegate {
  findUnique: MockFn;
}

interface MockStudentDelegate {
  findUnique: MockFn;
  findMany: MockFn;
  update: MockFn;
}

interface MockAccountDelegate {
  findUnique: MockFn;
}

interface MockPrismaClient {
  gradeLevel: MockGradeLevelDelegate;
  schoolClass: MockSchoolClassDelegate;
  classEnrollment: MockClassEnrollmentDelegate;
  academicYear: MockAcademicYearDelegate;
  student: MockStudentDelegate;
  account: MockAccountDelegate;
  $transaction: jest.Mock;
}

interface MockAuditService {
  record: MockFn;
}

describe('AcademicStructureService', () => {
  let service: AcademicStructureService;
  let mockPrisma: MockPrismaClient;
  let mockAudit: MockAuditService;

  const mockActor: AuthenticatedUser = {
    id: 'admin-actor-1',
    username: 'admin',
    role: 'admin',
  };

  const sampleDate = new Date('2026-08-01T00:00:00.000Z');

  const sampleGradeLevel = {
    id: 'gl-10',
    code: 'G10',
    displayName: 'Khối 10',
    sortOrder: 10,
    createdAt: sampleDate,
    updatedAt: sampleDate,
  };

  const sampleAcademicYear = {
    id: 'ay-2025-2026',
    code: '2025-2026',
    displayName: 'Năm học 2025-2026',
    startsOn: new Date('2025-08-01T00:00:00.000Z'),
    endsOn: new Date('2026-07-31T00:00:00.000Z'),
    isCurrent: true,
  };

  const sampleTeacher = {
    id: 'teacher-1',
    username: 'teacher1',
    displayName: 'Thầy Giáo A',
    role: 'teacher',
    isActive: true,
  };

  const sampleClass = {
    id: 'class-10a1',
    academicYearId: 'ay-2025-2026',
    gradeLevelId: 'gl-10',
    code: '10A1',
    displayName: 'Lớp 10A1',
    homeroomTeacherId: 'teacher-1',
    isActive: true,
    createdAt: sampleDate,
    updatedAt: sampleDate,
    academicYear: sampleAcademicYear,
    gradeLevel: sampleGradeLevel,
    homeroomTeacher: sampleTeacher,
  };

  const sampleStudent = {
    id: 'student-1',
    code: 'HS001',
    fullName: 'Nguyen Van A',
    grade: 'G9',
    className: '9A1',
    isActive: true,
  };

  const sampleEnrollment = {
    id: 'enr-1',
    studentId: 'student-1',
    classId: 'class-10a1',
    startsOn: sampleDate,
    endsOn: null,
    isActive: true,
    createdAt: sampleDate,
    updatedAt: sampleDate,
    student: sampleStudent,
    class: sampleClass,
  };

  beforeEach(() => {
    mockPrisma = {
      gradeLevel: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      schoolClass: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      classEnrollment: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      academicYear: {
        findUnique: jest.fn(),
      },
      student: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      account: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn((callback: (tx: MockPrismaClient) => unknown) =>
        callback(mockPrisma),
      ),
    };

    mockAudit = {
      record: jest.fn().mockResolvedValue(undefined),
    };

    service = new AcademicStructureService(
      mockPrisma as never,
      mockAudit as unknown as AuditService,
    );
  });

  describe('Grade Level Operations', () => {
    it('listGradeLevels returns serialized grade levels sorted by sortOrder', async () => {
      mockPrisma.gradeLevel.findMany.mockResolvedValue([sampleGradeLevel]);

      const result = await service.listGradeLevels();
      expect(result).toEqual({
        success: true,
        data: {
          grade_levels: [
            {
              id: 'gl-10',
              code: 'G10',
              display_name: 'Khối 10',
              sort_order: 10,
              created_at: sampleDate.toISOString(),
              updated_at: sampleDate.toISOString(),
            },
          ],
        },
      });
      expect(mockPrisma.gradeLevel.findMany).toHaveBeenCalledWith({
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('createGradeLevel creates grade level and records audit log', async () => {
      mockPrisma.gradeLevel.findUnique.mockResolvedValue(null);
      mockPrisma.gradeLevel.create.mockResolvedValue(sampleGradeLevel);

      const dto = {
        code: 'G10',
        display_name: 'Khối 10',
        sort_order: 10,
      };

      const result = await service.createGradeLevel(dto, mockActor);
      expect(result.success).toBe(true);
      expect(mockAudit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'academics.structure.grade_level.create',
          resourceId: 'gl-10',
        }),
        expect.anything(),
      );
    });

    it('createGradeLevel throws ConflictException when code exists', async () => {
      mockPrisma.gradeLevel.findUnique.mockResolvedValue(sampleGradeLevel);
      await expect(
        service.createGradeLevel(
          { code: 'G10', display_name: 'Khối 10' },
          mockActor,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('updateGradeLevel updates grade level and audit log', async () => {
      mockPrisma.gradeLevel.findUnique.mockResolvedValue(sampleGradeLevel);
      mockPrisma.gradeLevel.update.mockResolvedValue({
        ...sampleGradeLevel,
        displayName: 'Khối 10 Nâng Cao',
      });

      const result = await service.updateGradeLevel(
        'gl-10',
        { display_name: 'Khối 10 Nâng Cao' },
        mockActor,
      );

      expect(result.success).toBe(true);
      expect(mockAudit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'academics.structure.grade_level.update',
        }),
        expect.anything(),
      );
    });

    it('updateGradeLevel throws NotFoundException if grade level missing', async () => {
      mockPrisma.gradeLevel.findUnique.mockResolvedValue(null);
      await expect(
        service.updateGradeLevel('gl-99', { display_name: 'New' }, mockActor),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('School Class Operations', () => {
    it('listClasses passes filter options correctly', async () => {
      mockPrisma.schoolClass.findMany.mockResolvedValue([sampleClass]);

      const result = await service.listClasses({
        academic_year_id: 'ay-2025-2026',
        is_active: true,
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.schoolClass.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            academicYearId: 'ay-2025-2026',
            isActive: true,
          },
        }),
      );
    });

    it('createClass validates relations and homeroom teacher', async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValue(sampleAcademicYear);
      mockPrisma.gradeLevel.findUnique.mockResolvedValue(sampleGradeLevel);
      mockPrisma.account.findUnique.mockResolvedValue(sampleTeacher);
      mockPrisma.schoolClass.findUnique.mockResolvedValue(null);
      mockPrisma.schoolClass.create.mockResolvedValue(sampleClass);

      const dto = {
        academic_year_id: 'ay-2025-2026',
        grade_level_id: 'gl-10',
        code: '10A1',
        display_name: 'Lớp 10A1',
        homeroom_teacher_id: 'teacher-1',
      };

      const result = await service.createClass(dto, mockActor);
      expect(result.success).toBe(true);
      expect(mockAudit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'academics.structure.class.create',
        }),
        expect.anything(),
      );
    });

    it('createClass throws BadRequestException if homeroom teacher is not a teacher role', async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValue(sampleAcademicYear);
      mockPrisma.gradeLevel.findUnique.mockResolvedValue(sampleGradeLevel);
      mockPrisma.account.findUnique.mockResolvedValue({
        ...sampleTeacher,
        role: 'student',
      });

      const dto = {
        academic_year_id: 'ay-2025-2026',
        grade_level_id: 'gl-10',
        code: '10A1',
        display_name: 'Lớp 10A1',
        homeroom_teacher_id: 'teacher-1',
      };

      await expect(service.createClass(dto, mockActor)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('Roster & Enrollment Operations', () => {
    it('getClassRoster lists class enrollments', async () => {
      mockPrisma.schoolClass.findUnique.mockResolvedValue(sampleClass);
      mockPrisma.classEnrollment.findMany.mockResolvedValue([sampleEnrollment]);

      const result = await service.getClassRoster('class-10a1', true);
      expect(result.success).toBe(true);
      expect(mockPrisma.classEnrollment.findMany).toHaveBeenCalledWith({
        where: { classId: 'class-10a1', isActive: true },
        include: {
          student: true,
          class: {
            include: {
              academicYear: true,
              gradeLevel: true,
              homeroomTeacher: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('assignStudentEnrollment deactivates prior enrollment, creates new, updates legacy student grade/className, records audit log', async () => {
      mockPrisma.schoolClass.findUnique.mockResolvedValue(sampleClass);
      mockPrisma.student.findUnique.mockResolvedValue(sampleStudent);
      mockPrisma.classEnrollment.findFirst.mockResolvedValue(null);

      const priorEnrollment = {
        id: 'prior-enr',
        studentId: 'student-1',
        classId: 'old-class',
        isActive: true,
      };
      mockPrisma.classEnrollment.findMany.mockResolvedValue([priorEnrollment]);
      mockPrisma.classEnrollment.update.mockResolvedValue({
        ...priorEnrollment,
        isActive: false,
      });
      mockPrisma.classEnrollment.create.mockResolvedValue(sampleEnrollment);
      mockPrisma.student.update.mockResolvedValue({
        ...sampleStudent,
        grade: 'G10',
        className: '10A1',
      });

      const result = await service.assignStudentEnrollment(
        'class-10a1',
        { student_id: 'student-1', starts_on: '2026-08-01' },
        mockActor,
      );

      expect(result.success).toBe(true);
      // Verify deactivation of prior enrollment
      const updateCalls = (mockPrisma.classEnrollment.update as jest.Mock).mock
        .calls as [{ where: { id: string }; data: { isActive: boolean } }][];
      expect(updateCalls[0][0].where.id).toBe('prior-enr');
      expect(updateCalls[0][0].data.isActive).toBe(false);

      // Verify creation of new enrollment
      const createCalls = (mockPrisma.classEnrollment.create as jest.Mock).mock
        .calls as [
        { data: { studentId: string; classId: string; isActive: boolean } },
      ][];
      expect(createCalls[0][0].data.studentId).toBe('student-1');
      expect(createCalls[0][0].data.classId).toBe('class-10a1');
      expect(createCalls[0][0].data.isActive).toBe(true);
      // Verify atomic update of legacy Student fields
      expect(mockPrisma.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: {
          grade: 'G10',
          className: '10A1',
        },
      });
      // Verify audit log
      expect(mockAudit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'academics.structure.enrollment.assign',
          resourceType: 'ClassEnrollment',
        }),
        expect.anything(),
      );
    });

    it('assignStudentEnrollment throws ConflictException if student is already in target class', async () => {
      mockPrisma.schoolClass.findUnique.mockResolvedValue(sampleClass);
      mockPrisma.student.findUnique.mockResolvedValue(sampleStudent);
      mockPrisma.classEnrollment.findFirst.mockResolvedValue(sampleEnrollment);

      await expect(
        service.assignStudentEnrollment(
          'class-10a1',
          { student_id: 'student-1' },
          mockActor,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('requireActorId throws UnauthorizedException when actor is undefined', async () => {
      mockPrisma.gradeLevel.findUnique.mockResolvedValue(null);
      await expect(
        service.createGradeLevel(
          { code: 'G11', display_name: 'Khối 11' },
          undefined,
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('transferStudents deactivates old enrollment, creates new enrollment, updates student, and audits', async () => {
      mockPrisma.schoolClass.findUnique.mockResolvedValue(sampleClass);
      mockPrisma.student.findMany.mockResolvedValue([sampleStudent]);
      mockPrisma.student.update.mockResolvedValue({});
      mockPrisma.classEnrollment.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.classEnrollment.create.mockResolvedValue({ id: 'en-new' });

      const res = await service.transferStudents(
        { student_ids: ['student-1'], target_class_id: 'class-10a1' },
        mockActor,
      );

      expect(res.data.transferred_count).toBe(1);
      expect(mockAudit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'academics.structure.transfer',
        }),
        expect.anything(),
      );
    });

    it('transferStudents throws NotFoundException if target class does not exist', async () => {
      mockPrisma.schoolClass.findUnique.mockResolvedValue(null);
      await expect(
        service.transferStudents(
          { student_ids: ['student-1'], target_class_id: 'class-missing' },
          mockActor,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('transferStudents throws BadRequestException if target class is inactive', async () => {
      mockPrisma.schoolClass.findUnique.mockResolvedValue({
        ...sampleClass,
        isActive: false,
      });
      await expect(
        service.transferStudents(
          { student_ids: ['student-1'], target_class_id: 'class-10a1' },
          mockActor,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('transferStudents throws NotFoundException if any student is missing', async () => {
      mockPrisma.schoolClass.findUnique.mockResolvedValue(sampleClass);
      mockPrisma.student.findMany.mockResolvedValue([]); // No students found
      await expect(
        service.transferStudents(
          { student_ids: ['student-missing'], target_class_id: 'class-10a1' },
          mockActor,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('transferStudents throws BadRequestException if any student is inactive', async () => {
      mockPrisma.schoolClass.findUnique.mockResolvedValue(sampleClass);
      mockPrisma.student.findMany.mockResolvedValue([
        { ...sampleStudent, isActive: false },
      ]);
      await expect(
        service.transferStudents(
          { student_ids: ['student-1'], target_class_id: 'class-10a1' },
          mockActor,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('promoteClassCohort promotes active cohort from source class to target class and records audit', async () => {
      const targetClass = {
        ...sampleClass,
        id: 'class-11a1',
        code: '11A1',
        gradeLevel: { id: 'gl-11', code: 'G11' },
      };
      mockPrisma.schoolClass.findUnique
        .mockResolvedValueOnce(sampleClass) // sourceClass
        .mockResolvedValueOnce(targetClass); // targetClass
      mockPrisma.classEnrollment.findMany.mockResolvedValue([sampleEnrollment]);
      mockPrisma.classEnrollment.update.mockResolvedValue({
        ...sampleEnrollment,
        isActive: false,
      });
      mockPrisma.classEnrollment.create.mockResolvedValue({ id: 'enr-2' });
      mockPrisma.student.update.mockResolvedValue({});

      const res = await service.promoteClassCohort(
        {
          source_class_id: 'class-10a1',
          target_class_id: 'class-11a1',
        },
        mockActor,
      );

      expect(res.success).toBe(true);
      expect(res.data.promoted_count).toBe(1);
      expect(mockAudit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'academics.structure.promote',
          resourceId: 'class-11a1',
        }),
        expect.anything(),
      );
    });

    it('promoteClassCohort throws NotFoundException if source or target class is missing', async () => {
      mockPrisma.schoolClass.findUnique.mockResolvedValue(null);
      await expect(
        service.promoteClassCohort(
          {
            source_class_id: 'class-missing',
            target_class_id: 'class-11a1',
          },
          mockActor,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('promoteClassCohort throws BadRequestException if source or target class is inactive', async () => {
      mockPrisma.schoolClass.findUnique
        .mockResolvedValueOnce({ ...sampleClass, isActive: false })
        .mockResolvedValueOnce(sampleClass);

      await expect(
        service.promoteClassCohort(
          {
            source_class_id: 'class-10a1',
            target_class_id: 'class-11a1',
          },
          mockActor,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('promoteClassCohort throws error when requested student_ids are not actively enrolled in source class', async () => {
      mockPrisma.schoolClass.findUnique
        .mockResolvedValueOnce(sampleClass)
        .mockResolvedValueOnce(sampleClass);
      // Requested student-1 and student-2, but only student-1 is found
      mockPrisma.classEnrollment.findMany.mockResolvedValue([sampleEnrollment]);

      await expect(
        service.promoteClassCohort(
          {
            source_class_id: 'class-10a1',
            target_class_id: 'class-11a1',
            student_ids: ['student-1', 'student-2'],
          },
          mockActor,
        ),
      ).rejects.toThrow();
    });

    it('promoteClassCohort throws BadRequestException if no active students found in source class', async () => {
      mockPrisma.schoolClass.findUnique
        .mockResolvedValueOnce(sampleClass)
        .mockResolvedValueOnce(sampleClass);
      mockPrisma.classEnrollment.findMany.mockResolvedValue([]);

      await expect(
        service.promoteClassCohort(
          {
            source_class_id: 'class-10a1',
            target_class_id: 'class-11a1',
          },
          mockActor,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
