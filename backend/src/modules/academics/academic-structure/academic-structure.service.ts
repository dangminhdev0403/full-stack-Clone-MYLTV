import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import { ok } from '../../../common/http/api-response';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../identity-access/audit/audit.service';
import type {
  AssignStudentEnrollmentDto,
  CreateGradeLevelDto,
  CreateSchoolClassDto,
  ListClassesQueryDto,
  UpdateGradeLevelDto,
  UpdateSchoolClassDto,
} from './academic-structure.validation';

type SchoolClassPayload = {
  id: string;
  academicYearId: string;
  gradeLevelId: string;
  code: string;
  displayName: string;
  homeroomTeacherId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  academicYear?: {
    id: string;
    code: string;
    displayName: string;
    startsOn: Date;
    endsOn: Date;
    isCurrent: boolean;
  } | null;
  gradeLevel?: {
    id: string;
    code: string;
    displayName: string;
    sortOrder: number;
  } | null;
  homeroomTeacher?: {
    id: string;
    username: string;
    displayName: string;
    role: string;
    isActive: boolean;
  } | null;
};

type ClassEnrollmentPayload = {
  id: string;
  studentId: string;
  classId: string;
  startsOn: Date | null;
  endsOn: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  student?: {
    id: string;
    code: string;
    fullName: string;
    grade: string | null;
    className: string;
    isActive: boolean;
  } | null;
  class?: SchoolClassPayload | null;
};

@Injectable()
export class AcademicStructureService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ---------------------------------------------------------------------------
  // Grade Level Domain Operations
  // ---------------------------------------------------------------------------

  async listGradeLevels() {
    const gradeLevels = await this.prisma.gradeLevel.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return ok({
      grade_levels: gradeLevels.map((g) => this.serializeGradeLevel(g)),
    });
  }

  async createGradeLevel(dto: CreateGradeLevelDto, actor?: AuthenticatedUser) {
    const existing = await this.prisma.gradeLevel.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException('Grade level code already exists');
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const grade = await tx.gradeLevel.create({
        data: {
          ...(dto.id ? { id: dto.id } : {}),
          code: dto.code,
          displayName: dto.display_name,
          sortOrder: dto.sort_order ?? 0,
        },
      });

      await this.audit.record(
        {
          actorId: this.requireActorId(actor),
          action: 'academics.structure.grade_level.create',
          boundedContext: 'Academics',
          resourceType: 'GradeLevel',
          resourceId: grade.id,
          metadata: { code: grade.code, displayName: grade.displayName },
        },
        tx,
      );

      return grade;
    });

    return ok(this.serializeGradeLevel(created));
  }

  async updateGradeLevel(
    id: string,
    dto: UpdateGradeLevelDto,
    actor?: AuthenticatedUser,
  ) {
    const existing = await this.prisma.gradeLevel.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Grade level not found');
    }

    if (dto.code && dto.code !== existing.code) {
      const codeDuplicate = await this.prisma.gradeLevel.findUnique({
        where: { code: dto.code },
      });
      if (codeDuplicate) {
        throw new ConflictException('Grade level code already exists');
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const grade = await tx.gradeLevel.update({
        where: { id },
        data: {
          ...(dto.code ? { code: dto.code } : {}),
          ...(dto.display_name ? { displayName: dto.display_name } : {}),
          ...(dto.sort_order !== undefined
            ? { sortOrder: dto.sort_order }
            : {}),
        },
      });

      await this.audit.record(
        {
          actorId: this.requireActorId(actor),
          action: 'academics.structure.grade_level.update',
          boundedContext: 'Academics',
          resourceType: 'GradeLevel',
          resourceId: grade.id,
          metadata: { changes: dto },
        },
        tx,
      );

      return grade;
    });

    return ok(this.serializeGradeLevel(updated));
  }

  // ---------------------------------------------------------------------------
  // School Class Domain Operations
  // ---------------------------------------------------------------------------

  async listClasses(query: ListClassesQueryDto) {
    const where: Prisma.SchoolClassWhereInput = {};
    if (query.academic_year_id) {
      where.academicYearId = query.academic_year_id;
    }
    if (query.grade_level_id) {
      where.gradeLevelId = query.grade_level_id;
    }
    if (query.is_active !== undefined) {
      where.isActive = query.is_active;
    }

    const classes = await this.prisma.schoolClass.findMany({
      where,
      include: {
        academicYear: true,
        gradeLevel: true,
        homeroomTeacher: true,
      },
      orderBy: [{ academicYearId: 'asc' }, { code: 'asc' }],
    });

    return ok({
      classes: classes.map((c) => this.serializeClass(c)),
    });
  }

  async createClass(dto: CreateSchoolClassDto, actor?: AuthenticatedUser) {
    const year = await this.prisma.academicYear.findUnique({
      where: { id: dto.academic_year_id },
    });
    if (!year) {
      throw new NotFoundException('Academic year not found');
    }

    const grade = await this.prisma.gradeLevel.findUnique({
      where: { id: dto.grade_level_id },
    });
    if (!grade) {
      throw new NotFoundException('Grade level not found');
    }

    if (dto.homeroom_teacher_id) {
      await this.verifyHomeroomTeacher(dto.homeroom_teacher_id);
    }

    const codeConflict = await this.prisma.schoolClass.findUnique({
      where: {
        academicYearId_code: {
          academicYearId: dto.academic_year_id,
          code: dto.code,
        },
      },
    });
    if (codeConflict) {
      throw new ConflictException(
        'Class code already exists in this academic year',
      );
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const cls = await tx.schoolClass.create({
        data: {
          ...(dto.id ? { id: dto.id } : {}),
          academicYearId: dto.academic_year_id,
          gradeLevelId: dto.grade_level_id,
          code: dto.code,
          displayName: dto.display_name,
          homeroomTeacherId: dto.homeroom_teacher_id ?? null,
          isActive: dto.is_active ?? true,
        },
        include: {
          academicYear: true,
          gradeLevel: true,
          homeroomTeacher: true,
        },
      });

      await this.audit.record(
        {
          actorId: this.requireActorId(actor),
          action: 'academics.structure.class.create',
          boundedContext: 'Academics',
          resourceType: 'SchoolClass',
          resourceId: cls.id,
          metadata: {
            code: cls.code,
            academicYearId: cls.academicYearId,
            gradeLevelId: cls.gradeLevelId,
          },
        },
        tx,
      );

      return cls;
    });

    return ok(this.serializeClass(created));
  }

  async updateClass(
    id: string,
    dto: UpdateSchoolClassDto,
    actor?: AuthenticatedUser,
  ) {
    const existing = await this.prisma.schoolClass.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('School class not found');
    }

    const targetYearId = dto.academic_year_id ?? existing.academicYearId;
    const targetCode = dto.code ?? existing.code;

    if (dto.academic_year_id) {
      const year = await this.prisma.academicYear.findUnique({
        where: { id: dto.academic_year_id },
      });
      if (!year) {
        throw new NotFoundException('Academic year not found');
      }
    }

    if (dto.grade_level_id) {
      const grade = await this.prisma.gradeLevel.findUnique({
        where: { id: dto.grade_level_id },
      });
      if (!grade) {
        throw new NotFoundException('Grade level not found');
      }
    }

    if (dto.code || dto.academic_year_id) {
      if (
        targetCode !== existing.code ||
        targetYearId !== existing.academicYearId
      ) {
        const codeConflict = await this.prisma.schoolClass.findUnique({
          where: {
            academicYearId_code: {
              academicYearId: targetYearId,
              code: targetCode,
            },
          },
        });
        if (codeConflict && codeConflict.id !== id) {
          throw new ConflictException(
            'Class code already exists in this academic year',
          );
        }
      }
    }

    if (
      dto.homeroom_teacher_id !== undefined &&
      dto.homeroom_teacher_id !== null
    ) {
      await this.verifyHomeroomTeacher(dto.homeroom_teacher_id);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const cls = await tx.schoolClass.update({
        where: { id },
        data: {
          ...(dto.academic_year_id
            ? { academicYearId: dto.academic_year_id }
            : {}),
          ...(dto.grade_level_id ? { gradeLevelId: dto.grade_level_id } : {}),
          ...(dto.code ? { code: dto.code } : {}),
          ...(dto.display_name ? { displayName: dto.display_name } : {}),
          ...(dto.homeroom_teacher_id !== undefined
            ? { homeroomTeacherId: dto.homeroom_teacher_id }
            : {}),
          ...(dto.is_active !== undefined ? { isActive: dto.is_active } : {}),
        },
        include: {
          academicYear: true,
          gradeLevel: true,
          homeroomTeacher: true,
        },
      });

      await this.audit.record(
        {
          actorId: this.requireActorId(actor),
          action: 'academics.structure.class.update',
          boundedContext: 'Academics',
          resourceType: 'SchoolClass',
          resourceId: cls.id,
          metadata: { changes: dto },
        },
        tx,
      );

      return cls;
    });

    return ok(this.serializeClass(updated));
  }

  // ---------------------------------------------------------------------------
  // Roster & Enrollment Operations
  // ---------------------------------------------------------------------------

  async getClassRoster(classId: string, isActiveFilter?: boolean) {
    const cls = await this.prisma.schoolClass.findUnique({
      where: { id: classId },
    });
    if (!cls) {
      throw new NotFoundException('School class not found');
    }

    const where: Prisma.ClassEnrollmentWhereInput = {
      classId,
    };
    if (isActiveFilter !== undefined) {
      where.isActive = isActiveFilter;
    }

    const enrollments = await this.prisma.classEnrollment.findMany({
      where,
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

    return ok({
      class_id: classId,
      class_name: cls.displayName,
      class_code: cls.code,
      enrollments: enrollments.map((e) => this.serializeEnrollment(e)),
    });
  }

  async assignStudentEnrollment(
    classId: string,
    dto: AssignStudentEnrollmentDto,
    actor?: AuthenticatedUser,
  ) {
    const cls = await this.prisma.schoolClass.findUnique({
      where: { id: classId },
      include: { gradeLevel: true, academicYear: true },
    });
    if (!cls) {
      throw new NotFoundException('School class not found');
    }
    if (!cls.isActive) {
      throw new BadRequestException(
        'Cannot enroll student into an inactive class',
      );
    }

    const student = await this.prisma.student.findUnique({
      where: { id: dto.student_id },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    if (!student.isActive) {
      throw new BadRequestException('Cannot enroll an inactive student');
    }

    const existingActiveInClass = await this.prisma.classEnrollment.findFirst({
      where: {
        studentId: dto.student_id,
        classId,
        isActive: true,
      },
    });
    if (existingActiveInClass) {
      throw new ConflictException(
        'Student is already actively enrolled in this class',
      );
    }

    const startsOnDate = dto.starts_on
      ? this.parseDate(dto.starts_on)
      : new Date();

    const enrollment = await this.prisma.$transaction(async (tx) => {
      // 1. Deactivate prior active enrollment(s) with endsOn date
      const activePriorEnrollments = await tx.classEnrollment.findMany({
        where: {
          studentId: dto.student_id,
          isActive: true,
        },
      });

      for (const prior of activePriorEnrollments) {
        await tx.classEnrollment.update({
          where: { id: prior.id },
          data: {
            isActive: false,
            endsOn: startsOnDate,
          },
        });
      }

      // 2. Create new active enrollment record
      const created = await tx.classEnrollment.create({
        data: {
          studentId: dto.student_id,
          classId,
          startsOn: startsOnDate,
          isActive: true,
        },
        include: {
          student: true,
          class: {
            include: {
              gradeLevel: true,
              academicYear: true,
              homeroomTeacher: true,
            },
          },
        },
      });

      // 3. Atomically update legacy Student compatibility fields
      await tx.student.update({
        where: { id: dto.student_id },
        data: {
          grade: cls.gradeLevel.code,
          className: cls.code,
        },
      });

      // 4. Record audit event in same transaction
      await this.audit.record(
        {
          actorId: this.requireActorId(actor),
          action: 'academics.structure.enrollment.assign',
          boundedContext: 'Academics',
          resourceType: 'ClassEnrollment',
          resourceId: created.id,
          metadata: {
            studentId: dto.student_id,
            classId,
            previousEnrollmentsDeactivated: activePriorEnrollments.length,
            startsOn: this.toDate(startsOnDate),
          },
        },
        tx,
      );

      return created;
    });

    return ok(this.serializeEnrollment(enrollment));
  }

  async deactivateStudentEnrollment(
    classId: string,
    studentId: string,
    actor?: AuthenticatedUser,
  ) {
    const cls = await this.prisma.schoolClass.findUnique({
      where: { id: classId },
    });
    if (!cls) {
      throw new NotFoundException('School class not found');
    }

    const activeEnrollment = await this.prisma.classEnrollment.findFirst({
      where: {
        classId,
        studentId,
        isActive: true,
      },
    });
    if (!activeEnrollment) {
      throw new NotFoundException(
        'Active student enrollment not found in this class',
      );
    }

    const deactivated = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.classEnrollment.update({
        where: { id: activeEnrollment.id },
        data: {
          isActive: false,
          endsOn: new Date(),
        },
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
      });

      await this.audit.record(
        {
          actorId: this.requireActorId(actor),
          action: 'academics.structure.enrollment.deactivate',
          boundedContext: 'Academics',
          resourceType: 'ClassEnrollment',
          resourceId: updated.id,
          metadata: { studentId, classId },
        },
        tx,
      );

      return updated;
    });

    return ok(this.serializeEnrollment(deactivated));
  }

  // ---------------------------------------------------------------------------
  // Helper methods & Serializers
  // ---------------------------------------------------------------------------

  private async verifyHomeroomTeacher(teacherId: string): Promise<void> {
    const teacher = await this.prisma.account.findUnique({
      where: { id: teacherId },
    });
    if (!teacher || !teacher.isActive || teacher.role !== 'teacher') {
      throw new BadRequestException(
        'Homeroom teacher must exist, be active, and have teacher role',
      );
    }
  }

  private serializeGradeLevel(g: Prisma.GradeLevelGetPayload<object>) {
    return {
      id: g.id,
      code: g.code,
      display_name: g.displayName,
      sort_order: g.sortOrder,
      created_at: g.createdAt.toISOString(),
      updated_at: g.updatedAt.toISOString(),
    };
  }

  private serializeClass(c: SchoolClassPayload) {
    return {
      id: c.id,
      academic_year_id: c.academicYearId,
      grade_level_id: c.gradeLevelId,
      code: c.code,
      display_name: c.displayName,
      homeroom_teacher_id: c.homeroomTeacherId,
      is_active: c.isActive,
      academic_year: c.academicYear
        ? {
            id: c.academicYear.id,
            code: c.academicYear.code,
            display_name: c.academicYear.displayName,
            starts_on: this.toDate(c.academicYear.startsOn),
            ends_on: this.toDate(c.academicYear.endsOn),
            is_current: c.academicYear.isCurrent,
          }
        : undefined,
      grade_level: c.gradeLevel
        ? {
            id: c.gradeLevel.id,
            code: c.gradeLevel.code,
            display_name: c.gradeLevel.displayName,
            sort_order: c.gradeLevel.sortOrder,
          }
        : undefined,
      homeroom_teacher: c.homeroomTeacher
        ? {
            id: c.homeroomTeacher.id,
            username: c.homeroomTeacher.username,
            display_name: c.homeroomTeacher.displayName,
            role: c.homeroomTeacher.role,
            is_active: c.homeroomTeacher.isActive,
          }
        : null,
      created_at: c.createdAt.toISOString(),
      updated_at: c.updatedAt.toISOString(),
    };
  }

  private serializeEnrollment(e: ClassEnrollmentPayload) {
    return {
      id: e.id,
      student_id: e.studentId,
      class_id: e.classId,
      starts_on: e.startsOn ? this.toDate(e.startsOn) : null,
      ends_on: e.endsOn ? this.toDate(e.endsOn) : null,
      is_active: e.isActive,
      student: e.student
        ? {
            id: e.student.id,
            code: e.student.code,
            full_name: e.student.fullName,
            grade: e.student.grade,
            class_name: e.student.className,
            is_active: e.student.isActive,
          }
        : undefined,
      class: e.class ? this.serializeClass(e.class) : undefined,
      created_at: e.createdAt.toISOString(),
      updated_at: e.updatedAt.toISOString(),
    };
  }

  private requireActorId(actor?: AuthenticatedUser): string {
    if (!actor?.id) {
      throw new UnauthorizedException('Authentication required');
    }
    return actor.id;
  }

  private parseDate(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private toDate(value: Date): string {
    return value.toISOString().slice(0, 10);
  }
}
