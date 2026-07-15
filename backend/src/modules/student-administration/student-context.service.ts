import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Prisma, Student } from '@prisma/client';
import { ok } from '../../common/http/api-response';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthTokenService } from '../identity-access/auth-token.service';
import type {
  AccountSwitchOptionDto,
  SwitchStudentRequestDto,
  SwitchStudentResponseDto,
  StudentSummaryDto,
} from './dto/student-administration.dto';

const linkedStudentSelect = {
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

type LinkWithStudent = {
  accountId: string;
  student: StudentRecord;
};

@Injectable()
export class StudentContextService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async listLinkedStudentsForCurrentAccount(user?: AuthenticatedUser) {
    const actor = this.requireUser(user);
    const students = await this.listLinkedStudentsForAccount(actor.id);
    return ok(students);
  }

  async switchActiveStudent(
    user: AuthenticatedUser | undefined,
    payload: SwitchStudentRequestDto,
  ) {
    const actor = this.requireUser(user);
    if (payload.account_id !== undefined && payload.account_id !== actor.id) {
      throw new BadRequestException('account_id must match current account');
    }
    if (!payload.student_id) {
      throw new BadRequestException('student_id is required');
    }

    const student = await this.findLinkedStudentOrThrow(
      actor.id,
      payload.student_id,
    );
    const accessToken = await this.authTokenService.issueAccessToken({
      id: actor.id,
      username: actor.username,
      role: actor.role,
      activeStudentId: student.id,
    });

    return ok<SwitchStudentResponseDto>({
      access_token: accessToken,
      student: {
        id: student.id,
        full_name: student.fullName,
        class_name: student.className,
      },
    });
  }

  async getCurrentStudent(user?: AuthenticatedUser) {
    const actor = this.requireUser(user);
    const studentId =
      actor.activeStudentId ?? (await this.singleLinkedStudentId(actor.id));

    if (!studentId) {
      throw new NotFoundException('Active student is not selected');
    }

    const student = await this.findLinkedStudentOrThrow(actor.id, studentId);
    return ok(this.toStudentSummaryDto(student));
  }

  async getStudentSummary(studentId: string): Promise<StudentSummaryDto> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: linkedStudentSelect,
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return this.toStudentSummaryDto(student);
  }

  async listLinkedStudentsForAccount(
    accountId: string,
  ): Promise<AccountSwitchOptionDto[]> {
    const links = await this.prisma.studentAccountLink.findMany({
      where: {
        accountId,
        isActive: true,
        student: { isActive: true },
      },
      include: { student: { select: linkedStudentSelect } },
      orderBy: { createdAt: 'asc' },
    });

    return links.map((link) => this.toSwitchOptionDto(link as LinkWithStudent));
  }

  async assertAccountCanAccessStudent(
    accountId: string,
    studentId: string,
  ): Promise<void> {
    await this.findLinkedStudentOrThrow(accountId, studentId);
  }

  private async findLinkedStudentOrThrow(
    accountId: string,
    studentId: string,
  ): Promise<StudentRecord> {
    const link = await this.prisma.studentAccountLink.findFirst({
      where: {
        accountId,
        studentId,
        isActive: true,
        student: { isActive: true },
      },
      include: { student: { select: linkedStudentSelect } },
    });
    if (!link) {
      throw new NotFoundException('Student is not linked to this account');
    }
    return (link as LinkWithStudent).student;
  }

  private async singleLinkedStudentId(
    accountId: string,
  ): Promise<string | null> {
    const students = await this.listLinkedStudentsForAccount(accountId);
    return students.length === 1 ? students[0].student_id : null;
  }

  private requireUser(user?: AuthenticatedUser): AuthenticatedUser {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    return user;
  }

  private toSwitchOptionDto(link: LinkWithStudent): AccountSwitchOptionDto {
    return {
      account_id: link.accountId,
      student_id: link.student.id,
      student_name: link.student.fullName,
      student_code: link.student.code,
      class_name: link.student.className,
      grade: link.student.grade,
      avatar_url: link.student.avatarUrl,
      is_active: link.student.isActive,
    };
  }

  private toStudentSummaryDto(student: StudentRecord): StudentSummaryDto {
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
}
