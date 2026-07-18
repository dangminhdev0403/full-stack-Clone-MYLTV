import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AccountRole, Prisma, Student } from '@prisma/client';
import { ok } from '../../common/http/api-response';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  ReplaceStudentAccountsRequestDto,
  ReplaceStudentAccountsResponseDto,
  StudentListQueryDto,
  StudentListResponseDto,
  StudentDetailDto,
  StudentGuardianContactDto,
  StudentSummaryDto,
  StudentWriteRequestDto,
} from './dto/student-administration.dto';

const studentSelect = {
  id: true,
  code: true,
  fullName: true,
  avatarUrl: true,
  grade: true,
  className: true,
  schoolName: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.StudentSelect;

const studentDetailInclude = {
  guardianContacts: {
    orderBy: [
      { isEmergencyContact: 'desc' as const },
      { createdAt: 'asc' as const },
    ],
  },
} satisfies Prisma.StudentInclude;

type StudentRecord = Pick<
  Student,
  | 'id'
  | 'code'
  | 'fullName'
  | 'avatarUrl'
  | 'grade'
  | 'className'
  | 'schoolName'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt'
>;
type CreateStudentFields = StudentWriteRequestDto & {
  code: string;
  full_name: string;
  class_name: string;
};

@Injectable()
export class StudentAdministrationService {
  constructor(private readonly prisma: PrismaService) {}

  async listStudents(query: StudentListQueryDto, actor?: AuthenticatedUser) {
    const page = this.positiveInt(query.page, 1);
    const pageSize = Math.min(this.positiveInt(query.page_size, 20), 100);
    const where: Prisma.StudentWhereInput = {};

    if (query.q) {
      where.OR = [
        { code: { contains: query.q, mode: 'insensitive' } },
        { fullName: { contains: query.q, mode: 'insensitive' } },
        { className: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    if (query.grade) {
      where.grade = query.grade;
    }
    if (query.class_name) {
      where.className = query.class_name;
    }
    if (query.is_active !== undefined) {
      where.isActive = this.booleanQuery(query.is_active);
    }
    if (actor?.role === 'teacher') {
      where.accountLinks = {
        some: {
          accountId: actor.id,
          relationship: 'teacher',
          isActive: true,
        },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        select: studentSelect,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.student.count({ where }),
    ]);

    return ok<StudentListResponseDto>({
      items: items.map((student) => this.toSummaryDto(student)),
      page,
      page_size: pageSize,
      total,
      has_next: page * pageSize < total,
    });
  }

  async getStudent(id: string, actor?: AuthenticatedUser) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: studentDetailInclude,
    });
    if (!student) throw new NotFoundException('Student not found');
    if (actor?.role === 'teacher')
      await this.assertTeacherCanRead(actor.id, id);
    return ok<StudentDetailDto>(this.toDetailDto(student));
  }

  async createStudent(
    payload: StudentWriteRequestDto,
    actor?: AuthenticatedUser,
  ) {
    this.assertAdminActor(actor);
    const code = this.requiredString(payload.code, 'code');
    const fullName = this.requiredString(payload.full_name, 'full_name');
    const className = this.requiredString(payload.class_name, 'class_name');
    const createPayload: CreateStudentFields = {
      ...payload,
      code,
      full_name: fullName,
      class_name: className,
    };

    const guardianAccountIds = this.uniqueIds(
      createPayload.guardian_account_ids ?? [],
    );
    await this.assertAccountsExist(guardianAccountIds);

    try {
      const student = await this.prisma.$transaction(async (tx) => {
        const created = await tx.student.create({
          data: {
            code: createPayload.code,
            fullName: createPayload.full_name,
            className: createPayload.class_name,
            avatarUrl: createPayload.avatar_url ?? null,
            grade: createPayload.grade ?? null,
            ...(createPayload.school_name !== undefined
              ? { schoolName: createPayload.school_name }
              : {}),
            isActive: createPayload.is_active ?? true,
          },
          select: { id: true },
        });

        if (guardianAccountIds.length > 0) {
          await tx.studentAccountLink.createMany({
            data: guardianAccountIds.map((accountId) => ({
              studentId: created.id,
              accountId,
              relationship: 'guardian',
            })),
            skipDuplicates: true,
          });
        }

        return tx.student.findUnique({
          where: { id: created.id },
          select: studentSelect,
        });
      });

      if (!student) {
        throw new NotFoundException('Student was not created');
      }
      return ok(this.toSummaryDto(student));
    } catch (error) {
      this.mapPrismaWriteError(error);
    }
  }

  async updateStudent(
    id: string,
    payload: StudentWriteRequestDto,
    actor?: AuthenticatedUser,
  ) {
    this.assertAdminActor(actor);
    await this.findStudentOrThrow(id);

    const data: Prisma.StudentUpdateInput = {};
    if (payload.code !== undefined) {
      this.assertRequiredString(payload.code, 'code');
      data.code = payload.code;
    }
    if (payload.full_name !== undefined) {
      this.assertRequiredString(payload.full_name, 'full_name');
      data.fullName = payload.full_name;
    }
    if (payload.class_name !== undefined) {
      this.assertRequiredString(payload.class_name, 'class_name');
      data.className = payload.class_name;
    }
    if (payload.avatar_url !== undefined) {
      data.avatarUrl = payload.avatar_url;
    }
    if (payload.grade !== undefined) {
      data.grade = payload.grade;
    }
    if (payload.school_name !== undefined) {
      data.schoolName = payload.school_name;
    }
    if (payload.is_active !== undefined) data.isActive = payload.is_active;
    if (payload.date_of_birth !== undefined)
      data.dateOfBirth = payload.date_of_birth
        ? new Date(`${payload.date_of_birth}T00:00:00.000Z`)
        : null;
    if (payload.gender !== undefined) data.gender = payload.gender;
    if (payload.ethnicity !== undefined)
      data.ethnicity = this.nullableTrim(payload.ethnicity);
    if (payload.birth_place !== undefined)
      data.birthPlace = this.nullableTrim(payload.birth_place);
    if (payload.permanent_address !== undefined)
      data.permanentAddress = this.nullableTrim(payload.permanent_address);
    if (payload.cohort_start_year !== undefined)
      data.cohortStartYear = payload.cohort_start_year;
    if (payload.cohort_end_year !== undefined)
      data.cohortEndYear = payload.cohort_end_year;

    try {
      if (payload.guardian_contacts !== undefined) {
        const student = await this.prisma.$transaction(async (tx) => {
          await tx.student.update({
            where: { id },
            data,
            select: studentSelect,
          });
          await tx.studentGuardianContact.deleteMany({
            where: { studentId: id },
          });
          if (payload.guardian_contacts!.length)
            await tx.studentGuardianContact.createMany({
              data: payload.guardian_contacts!.map((contact) =>
                this.toGuardianCreate(id, contact),
              ),
            });
          return tx.student.findUnique({
            where: { id },
            include: studentDetailInclude,
          });
        });
        if (!student) throw new NotFoundException('Student not found');
        return ok<StudentDetailDto>(this.toDetailDto(student));
      }
      const student = await this.prisma.student.update({
        where: { id },
        data,
        select: studentSelect,
      });
      return ok<StudentDetailDto>(this.toDetailDto(student));
    } catch (error) {
      this.mapPrismaWriteError(error);
    }
  }

  async replaceStudentAccounts(
    id: string,
    payload: ReplaceStudentAccountsRequestDto,
    actor?: AuthenticatedUser,
  ) {
    this.assertAdminActor(actor);
    await this.findStudentOrThrow(id);
    if (!Array.isArray(payload.account_ids)) {
      throw new BadRequestException('account_ids must be an array');
    }

    const accountIds = this.uniqueIds(payload.account_ids);
    await this.assertAccountsExist(accountIds);

    await this.prisma.$transaction(async (tx) => {
      await tx.studentAccountLink.deleteMany({
        where: { studentId: id, relationship: 'guardian' },
      });
      if (accountIds.length > 0) {
        await tx.studentAccountLink.createMany({
          data: accountIds.map((accountId) => ({
            studentId: id,
            accountId,
            relationship: 'guardian',
          })),
          skipDuplicates: true,
        });
      }
    });

    return ok<ReplaceStudentAccountsResponseDto>({ updated: true });
  }

  private async findStudentOrThrow(id: string): Promise<StudentRecord> {
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: studentSelect,
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }

  private async assertTeacherCanRead(
    accountId: string,
    studentId: string,
  ): Promise<void> {
    const link = await this.prisma.studentAccountLink.findFirst({
      where: { accountId, studentId, relationship: 'teacher', isActive: true },
      select: { studentId: true },
    });
    if (!link) {
      throw new ForbiddenException('Student is outside teacher scope');
    }
  }

  private assertAdminActor(actor?: AuthenticatedUser): void {
    const role: AccountRole | undefined = actor?.role;
    if (role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('Student mutation requires admin role');
    }
  }

  private async assertAccountsExist(accountIds: string[]): Promise<void> {
    if (accountIds.length === 0) {
      return;
    }
    const accounts = await this.prisma.account.findMany({
      where: { id: { in: accountIds }, isActive: true },
      select: { id: true },
    });
    if (accounts.length !== accountIds.length) {
      throw new BadRequestException('One or more account IDs are invalid');
    }
  }

  private toSummaryDto(student: StudentRecord): StudentSummaryDto {
    return {
      id: student.id,
      code: student.code,
      full_name: student.fullName,
      avatar_url: student.avatarUrl,
      grade: student.grade,
      class_name: student.className,
      school_name: student.schoolName,
      is_active: student.isActive,
      created_at: student.createdAt.toISOString(),
      updated_at: student.updatedAt.toISOString(),
    };
  }

  private toDetailDto(
    student: StudentRecord & {
      dateOfBirth?: Date | null;
      gender?: 'male' | 'female' | 'other' | null;
      ethnicity?: string | null;
      birthPlace?: string | null;
      permanentAddress?: string | null;
      cohortStartYear?: number | null;
      cohortEndYear?: number | null;
      guardianContacts?: Array<{
        id: string;
        relationship:
          | 'father'
          | 'mother'
          | 'grandfather'
          | 'grandmother'
          | 'guardian'
          | 'other';
        relationshipLabel: string | null;
        fullName: string;
        phone: string;
        isEmergencyContact: boolean;
      }>;
    },
  ): StudentDetailDto {
    return {
      ...this.toSummaryDto(student),
      date_of_birth: student.dateOfBirth?.toISOString().slice(0, 10) ?? null,
      gender: student.gender ?? null,
      ethnicity: student.ethnicity ?? null,
      birth_place: student.birthPlace ?? null,
      permanent_address: student.permanentAddress ?? null,
      cohort_start_year: student.cohortStartYear ?? null,
      cohort_end_year: student.cohortEndYear ?? null,
      guardian_contacts: (student.guardianContacts ?? []).map((contact) => ({
        id: contact.id,
        relationship: contact.relationship,
        relationship_label: contact.relationshipLabel,
        full_name: contact.fullName,
        phone: contact.phone,
        is_emergency_contact: contact.isEmergencyContact,
      })),
    };
  }

  private toGuardianCreate(
    studentId: string,
    contact: StudentGuardianContactDto,
  ) {
    return {
      studentId,
      relationship: contact.relationship,
      relationshipLabel: contact.relationship_label,
      fullName: contact.full_name.trim(),
      phone: contact.phone.trim(),
      isEmergencyContact: contact.is_emergency_contact,
    };
  }

  private nullableTrim(value: string | null): string | null {
    return value === null ? null : value.trim();
  }

  private positiveInt(
    value: string | number | undefined,
    fallback: number,
  ): number {
    const parsed = Number(value ?? fallback);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }

  private booleanQuery(value: string | boolean): boolean {
    return value === true || value === 'true';
  }

  private uniqueIds(ids: string[]): string[] {
    return [
      ...new Set(ids.filter((id) => typeof id === 'string' && id !== '')),
    ];
  }

  private assertRequiredString(value: unknown, field: string): void {
    this.requiredString(value, field);
  }

  private requiredString(value: unknown, field: string): string {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new BadRequestException(`${field} is required`);
    }
    return value;
  }

  private mapPrismaWriteError(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Student code already exists');
    }
    throw error;
  }
}
