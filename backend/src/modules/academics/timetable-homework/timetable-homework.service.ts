import {
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
  CreateHomeworkDto,
  ListHomeworksQueryDto,
  UpdateHomeworkDto,
} from './timetable-homework.validation';

export class SubmitHomeworkDto {
  content?: string;
  attachments?: string[];
}
export class SaveTimetableDto {
  student_id!: string;
  week_start!: string;
  days!: unknown[];
}

type HomeworkRow = Prisma.HomeworkAssignmentGetPayload<{
  include: { submissions: true };
}>;

@Injectable()
export class TimetableHomeworkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getTimetable(studentId: string, weekStart?: string) {
    const start = weekStart ? new Date(weekStart) : new Date('2026-06-22');
    const schedule = await this.prisma.timetableSchedule.findFirst({
      where: { studentId, weekStart: start },
    });
    return {
      week_start: start.toISOString().slice(0, 10),
      days: schedule ? schedule.daysJson : [],
    };
  }

  async saveTimetable(body: SaveTimetableDto) {
    const weekStart = new Date(body.week_start);
    return this.prisma.timetableSchedule.upsert({
      where: { studentId_weekStart: { studentId: body.student_id, weekStart } },
      create: {
        studentId: body.student_id,
        weekStart,
        daysJson: body.days as Prisma.InputJsonValue,
      },
      update: { daysJson: body.days as Prisma.InputJsonValue },
    });
  }

  async getHomeworks(studentId: string, page = 1, limit = 20, status?: string) {
    const where: Prisma.HomeworkAssignmentWhereInput = {
      archivedAt: null,
      OR: [{ studentId }, { studentIds: { array_contains: studentId } }],
      ...(status ? { status } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.homeworkAssignment.findMany({
        where,
        orderBy: { assignedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { submissions: { where: { studentId } } },
      }),
      this.prisma.homeworkAssignment.count({ where }),
    ]);
    const completed = items.filter(
      (item) => item.submissions.length > 0,
    ).length;
    return {
      progress: { completed, total },
      items: items.map((item) => this.serialize(item)),
      pagination: { page, limit, total },
    };
  }

  async submitHomework(
    studentId: string,
    homeworkId: string,
    body: SubmitHomeworkDto,
  ) {
    const homework = await this.prisma.homeworkAssignment.findFirst({
      where: {
        id: homeworkId,
        archivedAt: null,
        OR: [{ studentId }, { studentIds: { array_contains: studentId } }],
      },
    });
    if (!homework) throw new NotFoundException('Không tìm thấy bài tập');
    const submission = await this.prisma.homeworkSubmission.upsert({
      where: { homeworkId_studentId: { homeworkId, studentId } },
      create: {
        homeworkId,
        studentId,
        content: body.content,
        attachmentsJson: body.attachments as Prisma.InputJsonValue,
        status: 'submitted',
      },
      update: {
        content: body.content,
        attachmentsJson: body.attachments as Prisma.InputJsonValue,
        status: 'submitted',
        submittedAt: new Date(),
      },
    });
    return {
      submitted: true,
      submitted_at: submission.submittedAt.toISOString(),
      status: submission.status,
    };
  }

  async listHomeworks(query: ListHomeworksQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.page_size ?? 20;
    const where: Prisma.HomeworkAssignmentWhereInput = {
      ...(query.include_archived ? {} : { archivedAt: null }),
      ...(query.status === 'archived' ? { archivedAt: { not: null } } : {}),
      ...(query.class_id ? { classId: query.class_id } : {}),
      AND: [
        ...(query.student_id
          ? [
              {
                OR: [
                  { studentId: query.student_id },
                  { studentIds: { array_contains: query.student_id } },
                ],
              },
            ]
          : []),
        ...(query.q
          ? [
              {
                OR: [
                  {
                    title: { contains: query.q, mode: 'insensitive' as const },
                  },
                  {
                    subject: {
                      contains: query.q,
                      mode: 'insensitive' as const,
                    },
                  },
                ],
              },
            ]
          : []),
      ],
    };
    const [items, total] = await Promise.all([
      this.prisma.homeworkAssignment.findMany({
        where,
        include: { submissions: true },
        orderBy: { assignedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.homeworkAssignment.count({ where }),
    ]);
    return ok({
      items: items.map((item) => this.serializeAdmin(item)),
      page,
      page_size: pageSize,
      total,
      has_next: page * pageSize < total,
    });
  }

  async getHomework(id: string) {
    const item = await this.prisma.homeworkAssignment.findUnique({
      where: { id },
      include: { submissions: true },
    });
    if (!item) throw new NotFoundException('Không tìm thấy bài tập');
    return ok(this.serializeAdmin(item));
  }

  async createHomework(body: CreateHomeworkDto, actor?: AuthenticatedUser) {
    const studentIds = await this.resolveTargets(body);
    const item = await this.prisma.$transaction(async (tx) => {
      const created = await tx.homeworkAssignment.create({
        data: {
          studentId:
            body.target_type === 'students' && studentIds.length === 1
              ? studentIds[0]
              : null,
          targetType: body.target_type,
          classId: body.class_id,
          studentIds,
          subjectId: body.subject_id,
          subject: body.subject,
          title: body.title,
          content: body.content,
          teacher: body.teacher,
          deadline: new Date(body.deadline),
          status: 'pending',
        },
        include: { submissions: true },
      });
      await this.audit.record(
        {
          actorId: this.actorId(actor),
          action: 'academics.homework.create',
          boundedContext: 'Academics',
          resourceType: 'HomeworkAssignment',
          resourceId: created.id,
          metadata: {
            target_type: body.target_type,
            target_count: studentIds.length,
          },
        },
        tx,
      );
      return created;
    });
    return ok(this.serializeAdmin(item));
  }

  async updateHomework(
    id: string,
    body: UpdateHomeworkDto,
    actor?: AuthenticatedUser,
  ) {
    await this.requireHomework(id);
    const item = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.homeworkAssignment.update({
        where: { id },
        data: {
          ...(body.subject_id !== undefined
            ? { subjectId: body.subject_id }
            : {}),
          ...(body.subject ? { subject: body.subject } : {}),
          ...(body.title ? { title: body.title } : {}),
          ...(body.content ? { content: body.content } : {}),
          ...(body.teacher ? { teacher: body.teacher } : {}),
          ...(body.deadline ? { deadline: new Date(body.deadline) } : {}),
        },
        include: { submissions: true },
      });
      await this.audit.record(
        {
          actorId: this.actorId(actor),
          action: 'academics.homework.update',
          boundedContext: 'Academics',
          resourceType: 'HomeworkAssignment',
          resourceId: id,
          metadata: { fields: Object.keys(body) },
        },
        tx,
      );
      return updated;
    });
    return ok(this.serializeAdmin(item));
  }

  async archiveHomework(id: string, actor?: AuthenticatedUser) {
    await this.requireHomework(id);
    const item = await this.prisma.$transaction(async (tx) => {
      const archived = await tx.homeworkAssignment.update({
        where: { id },
        data: { archivedAt: new Date(), status: 'archived' },
        include: { submissions: true },
      });
      await this.audit.record(
        {
          actorId: this.actorId(actor),
          action: 'academics.homework.archive',
          boundedContext: 'Academics',
          resourceType: 'HomeworkAssignment',
          resourceId: id,
        },
        tx,
      );
      return archived;
    });
    return ok(this.serializeAdmin(item));
  }

  async getOnlineStudy(studentId: string) {
    const items = await this.prisma.onlineStudySession.findMany({
      where: { studentId },
      orderBy: { startAt: 'asc' },
    });
    return {
      items: items.map((item) => ({
        id: item.id,
        subject: item.subject,
        teacher_name: item.teacher,
        starts_at: item.startAt.toISOString(),
        ends_at: item.endAt.toISOString(),
        platform: 'Google Meet',
        join_url: item.meetingUrl,
        material_urls: [],
        progress: 0,
        status: item.status,
      })),
      pagination: { page: 1, limit: 20, total: items.length },
    };
  }

  private async resolveTargets(body: CreateHomeworkDto) {
    if (body.target_type === 'students') {
      const students = await this.prisma.student.findMany({
        where: { id: { in: body.student_ids }, isActive: true },
        select: { id: true },
      });
      if (students.length !== body.student_ids?.length)
        throw new NotFoundException(
          'Có học sinh không tồn tại hoặc đã ngừng hoạt động',
        );
      return students.map((student) => student.id);
    }
    const schoolClass = await this.prisma.schoolClass.findUnique({
      where: { id: body.class_id },
      include: {
        enrollments: { where: { isActive: true }, select: { studentId: true } },
      },
    });
    if (!schoolClass) throw new NotFoundException('Không tìm thấy lớp học');
    return schoolClass.enrollments.map((enrollment) => enrollment.studentId);
  }

  private async requireHomework(id: string) {
    if (
      !(await this.prisma.homeworkAssignment.findUnique({
        where: { id },
        select: { id: true },
      }))
    )
      throw new NotFoundException('Không tìm thấy bài tập');
  }
  private actorId(actor?: AuthenticatedUser) {
    if (!actor?.id)
      throw new UnauthorizedException('Authenticated actor is required');
    return actor.id;
  }
  private targetIds(item: HomeworkRow) {
    return Array.isArray(item.studentIds)
      ? item.studentIds.filter((id): id is string => typeof id === 'string')
      : item.studentId
        ? [item.studentId]
        : [];
  }
  private serialize(item: HomeworkRow) {
    const submission = item.submissions[0];
    return {
      id: item.id,
      subject: item.subject,
      title: item.title,
      content: item.content,
      teacher: item.teacher,
      assigned_at: item.assignedAt.toISOString(),
      deadline: item.deadline.toISOString(),
      status: submission ? 'submitted' : item.status,
      submission_url: Array.isArray(submission?.attachmentsJson)
        ? (submission.attachmentsJson[0] ?? null)
        : null,
      submitted_at: submission?.submittedAt.toISOString() ?? null,
    };
  }
  private serializeAdmin(item: HomeworkRow) {
    const targetIds = this.targetIds(item);
    const submitted = new Set(
      item.submissions.map((submission) => submission.studentId),
    ).size;
    return {
      ...this.serialize(item),
      target_type: item.targetType,
      class_id: item.classId,
      student_ids: targetIds,
      archived_at: item.archivedAt?.toISOString() ?? null,
      progress: {
        assigned: targetIds.length,
        submitted,
        pending: Math.max(0, targetIds.length - submitted),
      },
    };
  }
}
