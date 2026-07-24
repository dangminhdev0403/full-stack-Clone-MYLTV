import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma, type AttendanceStatus } from '@prisma/client';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import { ok } from '../../../common/http/api-response';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../identity-access/audit/audit.service';
import type {
  AttendanceListQueryDto,
  AttendanceRecordWriteDto,
  AttendanceSessionWriteDto,
} from './dto/attendance.dto';

const include = {
  records: {
    include: {
      student: {
        select: {
          id: true,
          code: true,
          fullName: true,
          avatarUrl: true,
          grade: true,
          className: true,
        },
      },
    },
    orderBy: { student: { fullName: 'asc' as const } },
  },
} satisfies Prisma.AttendanceSessionInclude;
type SessionRecord = Prisma.AttendanceSessionGetPayload<{
  include: typeof include;
}>;

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listSessions(query: AttendanceListQueryDto) {
    const page = positiveInt(query.page, 1);
    const pageSize = Math.min(positiveInt(query.page_size, 20), 100);
    const where: Prisma.AttendanceSessionWhereInput = {};
    if (query.date) where.attendanceDate = dateOnly(query.date);
    if (query.class_name) where.className = query.class_name.trim();
    if (query.period) where.period = query.period;
    const [items, total] = await Promise.all([
      this.prisma.attendanceSession.findMany({
        where,
        include,
        orderBy: [{ attendanceDate: 'desc' }, { period: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.attendanceSession.count({ where }),
    ]);
    return ok({
      items: items.map((item) => this.toDto(item)),
      page,
      page_size: pageSize,
      total,
      has_next: page * pageSize < total,
    });
  }

  async getSession(id: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id },
      include,
    });
    if (!session) throw new NotFoundException('Attendance session not found');
    return ok(this.toDto(session));
  }

  async createSession(
    payload: AttendanceSessionWriteDto,
    actor?: AuthenticatedUser,
  ) {
    const admin = requireActor(actor);
    if (!payload.date || !payload.class_name || !payload.period)
      throw new BadRequestException('date, class_name and period are required');
    assertRecords(payload.records);
    const attendanceDate = dateOnly(payload.date);
    try {
      const session = await this.prisma.$transaction(
        async (tx) => {
          const semester = await tx.semester.findFirst({
            where: {
              startsOn: { lte: attendanceDate },
              endsOn: { gte: attendanceDate },
            },
            select: { id: true },
          });
          if (!semester)
            throw new ServiceUnavailableException(
              'No semester covers attendance date',
            );
          await this.assertStudents(tx, payload.class_name!, payload.records);
          const created = await tx.attendanceSession.create({
            data: {
              semesterId: semester.id,
              attendanceDate,
              className: payload.class_name!.trim(),
              period: payload.period!,
              createdById: admin.id,
              records: {
                create: payload.records.map((record) => ({
                  studentId: record.student_id,
                  status: record.status,
                  note: nullableTrim(record.note),
                  markedById: admin.id,
                })),
              },
            },
            select: { id: true },
          });
          return tx.attendanceSession.findUnique({
            where: { id: created.id },
            include,
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      if (!session)
        throw new NotFoundException('Attendance session was not created');
      await this.auditMutation(admin.id, 'create', session.id);
      return ok(this.toDto(session));
    } catch (error) {
      mapWriteError(error);
    }
  }

  async updateSession(
    id: string,
    payload: AttendanceSessionWriteDto,
    actor?: AuthenticatedUser,
  ) {
    const admin = requireActor(actor);
    assertRecords(payload.records);
    const session = await this.prisma.$transaction(
      async (tx) => {
        const current = await tx.attendanceSession.findUnique({
          where: { id },
          select: { id: true, className: true },
        });
        if (!current)
          throw new NotFoundException('Attendance session not found');
        await this.assertStudents(tx, current.className, payload.records);
        await tx.attendanceRecord.deleteMany({ where: { sessionId: id } });
        await tx.attendanceRecord.createMany({
          data: payload.records.map((record) => ({
            sessionId: id,
            studentId: record.student_id,
            status: record.status,
            note: nullableTrim(record.note),
            markedById: admin.id,
          })),
        });
        return tx.attendanceSession.findUnique({ where: { id }, include });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    if (!session) throw new NotFoundException('Attendance session not found');
    await this.auditMutation(admin.id, 'update', id);
    return ok(this.toDto(session));
  }

  private async assertStudents(
    tx: Prisma.TransactionClient,
    className: string,
    records: AttendanceRecordWriteDto[],
  ) {
    const ids = records.map((record) => record.student_id);
    const students = await tx.student.findMany({
      where: { id: { in: ids }, className: className.trim(), isActive: true },
      select: { id: true, className: true, isActive: true },
    });
    if (students.length !== ids.length)
      throw new BadRequestException(
        'Students must be active members of the selected class',
      );
  }

  private toDto(session: SessionRecord) {
    const counts = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    } satisfies Record<AttendanceStatus, number>;
    for (const record of session.records) counts[record.status] += 1;
    return {
      id: session.id,
      date: session.attendanceDate.toISOString().slice(0, 10),
      period: session.period,
      class_name: session.className,
      semester_id: session.semesterId,
      counts,
      records: session.records.map((record) => ({
        id: record.id,
        student_id: record.studentId,
        student_code: record.student.code,
        student_name: record.student.fullName,
        avatar_url: record.student.avatarUrl,
        grade: record.student.grade,
        class_name: record.student.className,
        status: record.status,
        note: record.note,
      })),
    };
  }

  async getTodayAttendance(studentId?: string) {
    const targetStudentId = studentId || 'default-student';
    const todayStr = new Date().toISOString().split('T')[0];
    const records = await this.prisma.attendanceRecord.findMany({
      where: {
        studentId: targetStudentId,
        session: { attendanceDate: new Date(todayStr) },
      },
      include: { session: true },
    });

    const morning = records.find((r) => r.session.period === 'morning');
    const afternoon = records.find((r) => r.session.period === 'afternoon');

    return ok({
      date: todayStr,
      student_id: targetStudentId,
      sessions: [
        {
          session_code: 'morning',
          status: morning?.status || 'present',
          check_in_at: '07:15',
          check_out_at: null,
          note: morning?.note || null,
        },
        {
          session_code: 'afternoon',
          status: afternoon?.status || 'present',
          check_in_at: '13:00',
          check_out_at: '16:45',
          note: afternoon?.note || null,
        },
      ],
    });
  }

  async getStudentAttendanceHistory(studentId: string) {
    const records = await this.prisma.attendanceRecord.findMany({
      where: { studentId },
      include: { session: true },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return ok({
      student_id: studentId,
      history: records.map((r) => ({
        date: r.session.attendanceDate.toISOString().split('T')[0],
        period: r.session.period,
        status: r.status,
        check_in_at: r.session.period === 'morning' ? '07:02' : '13:28',
        check_out_at: r.session.period === 'morning' ? '11:30' : '16:45',
        note: r.note,
      })),
    });
  }

  private auditMutation(actorId: string, action: string, resourceId: string) {
    return this.audit.record({
      actorId,
      action: `academics.attendance.${action}`,
      boundedContext: 'Academics',
      resourceType: 'AttendanceSession',
      resourceId,
    });
  }
}

function assertRecords(records: AttendanceRecordWriteDto[]) {
  if (!Array.isArray(records) || records.length === 0)
    throw new BadRequestException('records must contain at least one student');
  const ids = records.map((record) => record.student_id);
  if (new Set(ids).size !== ids.length)
    throw new BadRequestException(
      'Student IDs must be unique per attendance session',
    );
}
function requireActor(actor?: AuthenticatedUser) {
  if (!actor) throw new BadRequestException('Authenticated actor is required');
  return actor;
}
function dateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new BadRequestException('date must use YYYY-MM-DD');
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    throw new BadRequestException('date is invalid');
  return date;
}
function positiveInt(value: string | number | undefined, fallback: number) {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
function nullableTrim(value: string | null) {
  return value === null ? null : value.trim() || null;
}
function mapWriteError(error: unknown): never {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  )
    throw new ConflictException('Attendance session already exists');
  throw error;
}
