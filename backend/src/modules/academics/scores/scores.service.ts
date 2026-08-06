import { BadRequestException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import { ok } from '../../../common/http/api-response';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../identity-access/audit/audit.service';
import type {
  ListScoresQueryDto,
  SaveRewardDisciplineDto,
  SaveScoreDto,
} from './scores.validation';

export type {
  SaveRewardDisciplineDto,
  SaveScoreDto,
} from './scores.validation';

@Injectable()
export class ScoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listScores(query: ListScoresQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.page_size ?? 20));

    const where: Prisma.StudentScoreRecordWhereInput = {};

    const studentFilter = query.student_id || query.student;
    const classFilter = query.class_name || query.class;
    const yearFilter = query.school_year || query.academic_year;
    const semesterFilter =
      query.semester_id || query.semester || query.semester_code;
    const subjectFilter = query.subject_id || query.subject;

    if (yearFilter) {
      where.schoolYear = yearFilter;
    }

    if (semesterFilter) {
      where.OR = [
        { semesterId: semesterFilter },
        { semesterCode: semesterFilter },
      ];
    }

    if (subjectFilter) {
      const subjectCond: Prisma.StudentScoreRecordWhereInput[] = [
        { subjectId: subjectFilter },
        { subjectName: { contains: subjectFilter, mode: 'insensitive' } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: subjectCond }];
        delete where.OR;
      } else {
        where.OR = subjectCond;
      }
    }

    let matchingStudentIds: string[] | undefined;

    if (classFilter || (studentFilter && !isUuid(studentFilter))) {
      const studentWhere: Prisma.StudentWhereInput = { isActive: true };
      if (classFilter) {
        studentWhere.className = classFilter.trim();
      }
      if (studentFilter && !isUuid(studentFilter)) {
        studentWhere.OR = [
          { code: { contains: studentFilter.trim(), mode: 'insensitive' } },
          { fullName: { contains: studentFilter.trim(), mode: 'insensitive' } },
        ];
      }
      const students = await this.prisma.student.findMany({
        where: studentWhere,
        select: { id: true },
      });
      matchingStudentIds = students.map((s) => s.id);
      if (matchingStudentIds.length === 0) {
        return ok({
          items: [],
          page,
          page_size: pageSize,
          total: 0,
          has_next: false,
        });
      }
    } else if (studentFilter && isUuid(studentFilter)) {
      matchingStudentIds = [studentFilter];
    }

    if (matchingStudentIds) {
      where.studentId = { in: matchingStudentIds };
    }

    if (query.q) {
      const qTrim = query.q.trim();
      const qCond: Prisma.StudentScoreRecordWhereInput[] = [
        { subjectName: { contains: qTrim, mode: 'insensitive' } },
        { teacherComment: { contains: qTrim, mode: 'insensitive' } },
      ];
      if (where.AND) {
        (where.AND as Prisma.StudentScoreRecordWhereInput[]).push({
          OR: qCond,
        });
      } else if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: qCond }];
        delete where.OR;
      } else {
        where.OR = qCond;
      }
    }

    const [records, total] = await Promise.all([
      this.prisma.studentScoreRecord.findMany({
        where,
        orderBy: [{ schoolYear: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.studentScoreRecord.count({ where }),
    ]);

    const sIds = Array.from(new Set(records.map((r) => r.studentId)));
    const studentInfo =
      sIds.length > 0
        ? await this.prisma.student.findMany({
            where: { id: { in: sIds } },
            select: { id: true, code: true, fullName: true, className: true },
          })
        : [];
    const studentMap = new Map(studentInfo.map((s) => [s.id, s]));

    const items = records.map((r) => {
      const s = studentMap.get(r.studentId);
      const oralScores = (r.oralScoresJson as number[]) || [];
      const fifteenMinScores = (r.fifteenMinScoresJson as number[]) || [];
      const midtermScore = r.midtermScore ?? null;
      const finalScore = r.finalScore ?? null;
      const averageScore =
        r.averageScore ??
        calculateAverage(
          oralScores,
          fifteenMinScores,
          midtermScore,
          finalScore,
        );
      return {
        id: r.id,
        student_id: r.studentId,
        student_code: s?.code ?? null,
        student_name: s?.fullName ?? null,
        class_name: s?.className ?? null,
        semester_id: r.semesterId,
        school_year: r.schoolYear,
        semester_code: r.semesterCode,
        subject_id: r.subjectId,
        subject_name: r.subjectName,
        oral_scores: oralScores,
        fifteen_minute_scores: fifteenMinScores,
        midterm_score: midtermScore,
        final_score: finalScore,
        average_score: averageScore,
        teacher_comment: r.teacherComment ?? null,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      };
    });

    return ok({
      items,
      page,
      page_size: pageSize,
      total,
      has_next: page * pageSize < total,
    });
  }

  async getStudentScores(
    studentId: string,
    schoolYear?: string,
    semester?: string,
  ) {
    const records = await this.prisma.studentScoreRecord.findMany({
      where: {
        studentId,
        ...(schoolYear ? { schoolYear } : {}),
        ...(semester ? { semesterCode: semester } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    const resolvedSchoolYear =
      schoolYear || (records.length > 0 ? records[0].schoolYear : null);
    const resolvedSemester =
      semester || (records.length > 0 ? records[0].semesterCode : null);

    return ok({
      student_id: studentId,
      school_year: resolvedSchoolYear,
      semester: resolvedSemester,
      subjects: records.map((r) => {
        const oralScores = (r.oralScoresJson as number[]) || [];
        const fifteenMinScores = (r.fifteenMinScoresJson as number[]) || [];
        const midtermScore = r.midtermScore ?? null;
        const finalScore = r.finalScore ?? null;
        const avg =
          r.averageScore ??
          calculateAverage(
            oralScores,
            fifteenMinScores,
            midtermScore,
            finalScore,
          );
        const classification =
          avg !== null
            ? avg >= 9
              ? 'excellent'
              : avg >= 8
                ? 'good'
                : avg >= 6.5
                  ? 'fair'
                  : 'average'
            : null;
        return {
          id: r.id,
          subject_id: r.subjectId,
          subject_name: r.subjectName,
          oral_scores: oralScores,
          fifteen_minute_scores: fifteenMinScores,
          midterm_score: midtermScore,
          final_score: finalScore,
          average_score: avg,
          classification,
          teacher_comment: r.teacherComment ?? null,
        };
      }),
    });
  }

  async getRewardDiscipline(
    studentId: string,
    schoolYear?: string,
    semester?: string,
    type?: string,
  ) {
    const records = await this.prisma.rewardDisciplineRecord.findMany({
      where: {
        studentId,
        ...(schoolYear ? { schoolYear } : {}),
        ...(semester ? { semesterId: semester } : {}),
        ...(type ? { type } : {}),
      },
      orderBy: { date: 'desc' },
    });

    return ok(
      records.map((r) => ({
        id: r.id,
        student_id: r.studentId,
        semester_id: r.semesterId ?? null,
        school_year: r.schoolYear ?? null,
        type: r.type as 'reward' | 'discipline',
        title: r.title,
        content: r.content,
        recorded_at: r.date.toISOString().split('T')[0],
        recorded_by_name: r.issuer ?? null,
        points: null,
        status: 'active',
      })),
    );
  }

  async saveScoreRecord(body: SaveScoreDto, actor?: AuthenticatedUser) {
    const admin = requireActor(actor);

    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: { id: body.student_id },
        select: { id: true, isActive: true },
      });
      if (!student || !student.isActive) {
        throw new BadRequestException(
          'Student does not exist or is not active',
        );
      }

      const semester = await this.resolveAndValidateSemester(tx, body);

      const computedAverage =
        body.average_score ??
        calculateAverage(
          body.oral_scores || [],
          body.fifteen_min_scores || [],
          body.midterm_score ?? null,
          body.final_score ?? null,
        );

      const record = await tx.studentScoreRecord.upsert({
        where: {
          studentId_semesterId_subjectId: {
            studentId: body.student_id,
            semesterId: semester.id,
            subjectId: body.subject_id,
          },
        },
        create: {
          studentId: body.student_id,
          semesterId: semester.id,
          schoolYear: semester.schoolYear,
          semesterCode: semester.semesterCode,
          subjectId: body.subject_id,
          subjectName: body.subject_name,
          oralScoresJson: body.oral_scores || [],
          fifteenMinScoresJson: body.fifteen_min_scores || [],
          midtermScore: body.midterm_score ?? null,
          finalScore: body.final_score ?? null,
          averageScore: computedAverage,
          teacherComment: body.teacher_comment ?? null,
        },
        update: {
          subjectName: body.subject_name,
          schoolYear: semester.schoolYear,
          semesterCode: semester.semesterCode,
          oralScoresJson: body.oral_scores || [],
          fifteenMinScoresJson: body.fifteen_min_scores || [],
          midtermScore: body.midterm_score ?? null,
          finalScore: body.final_score ?? null,
          averageScore: computedAverage,
          teacherComment: body.teacher_comment ?? null,
        },
      });

      await this.audit.record(
        {
          actorId: admin.id,
          action: 'academics.scores.save',
          boundedContext: 'Academics',
          resourceType: 'StudentScoreRecord',
          resourceId: record.id,
          metadata: {
            student_id: body.student_id,
            semester_id: semester.id,
            subject_id: body.subject_id,
          },
        },
        tx,
      );

      return ok({
        id: record.id,
        student_id: record.studentId,
        semester_id: record.semesterId,
        school_year: record.schoolYear,
        semester_code: record.semesterCode,
        subject_id: record.subjectId,
        subject_name: record.subjectName,
        oral_scores: (record.oralScoresJson as number[]) || [],
        fifteen_minute_scores: (record.fifteenMinScoresJson as number[]) || [],
        midterm_score: record.midtermScore ?? null,
        final_score: record.finalScore ?? null,
        average_score: record.averageScore ?? null,
        teacher_comment: record.teacherComment ?? null,
      });
    });
  }

  async saveRewardDisciplineRecord(
    body: SaveRewardDisciplineDto,
    actor?: AuthenticatedUser,
  ) {
    const admin = requireActor(actor);

    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: { id: body.student_id },
        select: { id: true, isActive: true },
      });
      if (!student || !student.isActive) {
        throw new BadRequestException(
          'Student does not exist or is not active',
        );
      }

      let semesterId: string | null = null;
      let schoolYear: string | null = body.school_year ?? null;

      if (body.semester_id) {
        const sem = await tx.semester.findUnique({
          where: { id: body.semester_id },
          include: { academicYear: true },
        });
        if (!sem) {
          throw new BadRequestException('Semester does not exist');
        }
        semesterId = sem.id;
        if (body.school_year && body.school_year !== sem.academicYear.code) {
          throw new BadRequestException(
            'Incoherent semester metadata: school_year does not match semester academic year',
          );
        }
        schoolYear = sem.academicYear.code;
      }

      const record = await tx.rewardDisciplineRecord.create({
        data: {
          studentId: body.student_id,
          semesterId,
          schoolYear,
          type: body.type,
          title: body.title,
          content: body.content,
          date: new Date(body.date),
          issuer: body.issuer ?? admin.username ?? null,
        },
      });

      await this.audit.record(
        {
          actorId: admin.id,
          action: 'academics.scores.save_reward_discipline',
          boundedContext: 'Academics',
          resourceType: 'RewardDisciplineRecord',
          resourceId: record.id,
          metadata: {
            student_id: body.student_id,
            type: body.type,
          },
        },
        tx,
      );

      return ok({
        id: record.id,
        student_id: record.studentId,
        semester_id: record.semesterId ?? null,
        school_year: record.schoolYear ?? null,
        type: record.type,
        title: record.title,
        content: record.content,
        recorded_at: record.date.toISOString().split('T')[0],
        recorded_by_name: record.issuer ?? null,
      });
    });
  }

  private async resolveAndValidateSemester(
    tx: Prisma.TransactionClient,
    body: SaveScoreDto,
  ): Promise<{ id: string; schoolYear: string; semesterCode: string }> {
    if (body.semester_id) {
      const sem = await tx.semester.findUnique({
        where: { id: body.semester_id },
        include: { academicYear: true },
      });
      if (!sem) {
        throw new BadRequestException('Semester does not exist');
      }
      if (body.school_year && body.school_year !== sem.academicYear.code) {
        throw new BadRequestException(
          'Incoherent semester metadata: school_year does not match semester academic year',
        );
      }
      if (body.semester_code && body.semester_code !== sem.code) {
        throw new BadRequestException(
          'Incoherent semester metadata: semester_code does not match semester code',
        );
      }
      return {
        id: sem.id,
        schoolYear: sem.academicYear.code,
        semesterCode: sem.code,
      };
    }

    const whereSem: Prisma.SemesterWhereInput = {};
    if (body.school_year) {
      whereSem.academicYear = { code: body.school_year };
    }
    if (body.semester_code) {
      whereSem.code = body.semester_code;
    }

    const sem = await tx.semester.findFirst({
      where: whereSem,
      include: { academicYear: true },
      orderBy: { startsOn: 'desc' },
    });

    if (!sem) {
      throw new BadRequestException(
        'Semester not found matching specified metadata',
      );
    }

    return {
      id: sem.id,
      schoolYear: sem.academicYear.code,
      semesterCode: sem.code,
    };
  }
}

function requireActor(actor?: AuthenticatedUser): AuthenticatedUser {
  if (!actor || !actor.id) {
    throw new BadRequestException('Authenticated actor is required');
  }
  return actor;
}

function calculateAverage(
  oral: number[],
  fifteenMin: number[],
  midterm: number | null,
  finalScore: number | null,
): number | null {
  let sum = 0;
  let count = 0;

  for (const s of oral) {
    sum += s;
    count += 1;
  }
  for (const s of fifteenMin) {
    sum += s;
    count += 1;
  }
  if (midterm !== null) {
    sum += midterm * 2;
    count += 2;
  }
  if (finalScore !== null) {
    sum += finalScore * 3;
    count += 3;
  }

  if (count === 0) return null;
  return Math.round((sum / count) * 10) / 10;
}

function isUuid(val: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    val,
  );
}
