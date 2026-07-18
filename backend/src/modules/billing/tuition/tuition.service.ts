import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type TuitionChargeStatus } from '@prisma/client';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import { ok } from '../../../common/http/api-response';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../identity-access/audit/audit.service';
import type {
  TuitionCreateDto,
  TuitionListQueryDto,
  TuitionUpdateDto,
} from './dto/tuition.dto';

const include = {
  student: {
    select: {
      id: true,
      code: true,
      fullName: true,
      grade: true,
      className: true,
    },
  },
  semester: {
    select: {
      id: true,
      code: true,
      displayName: true,
      academicYear: {
        select: { id: true, code: true, displayName: true },
      },
    },
  },
} satisfies Prisma.TuitionChargeInclude;
type ChargeRecord = Prisma.TuitionChargeGetPayload<{ include: typeof include }>;

@Injectable()
export class TuitionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listCharges(query: TuitionListQueryDto) {
    const page = positiveInt(query.page, 1);
    const pageSize = Math.min(positiveInt(query.page_size, 20), 100);
    const where = this.listWhere(query);
    const [items, total, aggregate] = await Promise.all([
      this.prisma.tuitionCharge.findMany({
        where,
        include,
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.tuitionCharge.count({ where }),
      this.prisma.tuitionCharge.aggregate({
        where: { AND: [where, { isWaived: false }] },
        _sum: { amountDue: true, amountPaid: true },
      }),
    ]);
    const amountDue = aggregate._sum.amountDue ?? 0;
    const amountPaid = aggregate._sum.amountPaid ?? 0;
    return ok({
      items: items.map((item) => this.toDto(item)),
      page,
      page_size: pageSize,
      total,
      has_next: page * pageSize < total,
      summary: {
        amount_due: amountDue,
        amount_paid: amountPaid,
        amount_outstanding: Math.max(amountDue - amountPaid, 0),
      },
    });
  }

  async getCharge(id: string) {
    const charge = await this.prisma.tuitionCharge.findUnique({
      where: { id },
      include,
    });
    if (!charge) throw new NotFoundException('Tuition charge not found');
    return ok(this.toDto(charge));
  }

  async createCharge(payload: TuitionCreateDto, actor?: AuthenticatedUser) {
    const admin = requireActor(actor);
    try {
      const charge = await this.prisma.$transaction(
        async (tx) => {
          await this.assertStudentAndSemester(
            tx,
            payload.student_id,
            payload.semester_id,
          );
          return tx.tuitionCharge.create({
            data: {
              studentId: payload.student_id,
              semesterId: payload.semester_id,
              title: payload.title.trim(),
              amountDue: payload.amount_due,
              amountPaid: payload.is_waived ? 0 : payload.amount_paid,
              status: deriveStatus(
                payload.amount_due,
                payload.amount_paid,
                payload.is_waived,
              ),
              dueDate: nullableDate(payload.due_date),
              note: nullableTrim(payload.note),
              isWaived: payload.is_waived,
              createdById: admin.id,
            },
            include,
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      await this.auditMutation(admin.id, 'create', charge.id);
      return ok(this.toDto(charge));
    } catch (error) {
      mapWriteError(error);
    }
  }

  async updateCharge(
    id: string,
    payload: TuitionUpdateDto,
    actor?: AuthenticatedUser,
  ) {
    const admin = requireActor(actor);
    try {
      const charge = await this.prisma.$transaction(
        async (tx) => {
          const current = await tx.tuitionCharge.findUnique({
            where: { id },
            include,
          });
          if (!current) throw new NotFoundException('Tuition charge not found');
          const amountDue = payload.amount_due ?? current.amountDue;
          const isWaived = payload.is_waived ?? current.isWaived;
          const amountPaid = isWaived
            ? 0
            : (payload.amount_paid ?? current.amountPaid);
          if (amountPaid > amountDue)
            throw new BadRequestException(
              'amount_paid cannot exceed amount_due',
            );
          return tx.tuitionCharge.update({
            where: { id },
            data: {
              ...(payload.title !== undefined
                ? { title: payload.title.trim() }
                : {}),
              ...(payload.amount_due !== undefined ? { amountDue } : {}),
              ...(payload.amount_paid !== undefined || isWaived
                ? { amountPaid }
                : {}),
              ...(payload.due_date !== undefined
                ? { dueDate: nullableDate(payload.due_date) }
                : {}),
              ...(payload.note !== undefined
                ? { note: nullableTrim(payload.note) }
                : {}),
              ...(payload.is_waived !== undefined ? { isWaived } : {}),
              status: deriveStatus(amountDue, amountPaid, isWaived),
            },
            include,
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      await this.auditMutation(admin.id, 'update', id);
      return ok(this.toDto(charge));
    } catch (error) {
      mapWriteError(error);
    }
  }

  private listWhere(query: TuitionListQueryDto) {
    const where: Prisma.TuitionChargeWhereInput = {};
    if (query.student_id) where.studentId = query.student_id;
    if (query.semester_id) where.semesterId = query.semester_id;
    if (query.academic_year_id)
      where.semester = { academicYearId: query.academic_year_id };
    if (query.class_name)
      where.student = { className: query.class_name.trim() };
    if (query.status) where.status = query.status;
    return where;
  }

  private async assertStudentAndSemester(
    tx: Prisma.TransactionClient,
    studentId: string,
    semesterId: string,
  ) {
    const [student, semester] = await Promise.all([
      tx.student.findUnique({
        where: { id: studentId },
        select: { id: true, isActive: true },
      }),
      tx.semester.findUnique({
        where: { id: semesterId },
        select: { id: true },
      }),
    ]);
    if (!student?.isActive)
      throw new BadRequestException('Student must be active');
    if (!semester) throw new BadRequestException('Semester does not exist');
  }

  private toDto(charge: ChargeRecord) {
    return {
      id: charge.id,
      student_id: charge.studentId,
      student_code: charge.student.code,
      student_name: charge.student.fullName,
      grade: charge.student.grade,
      class_name: charge.student.className,
      semester_id: charge.semesterId,
      semester_name: charge.semester.displayName,
      academic_year_id: charge.semester.academicYear.id,
      academic_year_name: charge.semester.academicYear.displayName,
      title: charge.title,
      amount_due: charge.amountDue,
      amount_paid: charge.amountPaid,
      amount_outstanding: charge.isWaived
        ? 0
        : Math.max(charge.amountDue - charge.amountPaid, 0),
      status: charge.status,
      due_date: charge.dueDate?.toISOString().slice(0, 10) ?? null,
      note: charge.note,
      is_waived: charge.isWaived,
      created_at: charge.createdAt.toISOString(),
      updated_at: charge.updatedAt.toISOString(),
    };
  }

  private auditMutation(actorId: string, action: string, resourceId: string) {
    return this.audit.record({
      actorId,
      action: `billing.tuition.${action}`,
      boundedContext: 'Billing',
      resourceType: 'TuitionCharge',
      resourceId,
    });
  }
}

function deriveStatus(
  amountDue: number,
  amountPaid: number,
  isWaived: boolean,
): TuitionChargeStatus {
  if (isWaived) return 'waived';
  if (amountPaid === 0) return 'unpaid';
  if (amountPaid >= amountDue) return 'paid';
  return 'partial';
}
function requireActor(actor?: AuthenticatedUser) {
  if (!actor) throw new BadRequestException('Authenticated actor is required');
  return actor;
}
function positiveInt(value: string | number | undefined, fallback: number) {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
function nullableTrim(value: string | null) {
  return value === null ? null : value.trim() || null;
}
function nullableDate(value: string | null) {
  return value === null ? null : new Date(`${value}T00:00:00.000Z`);
}
function mapWriteError(error: unknown): never {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  )
    throw new ConflictException('Tuition charge already exists');
  throw error;
}
