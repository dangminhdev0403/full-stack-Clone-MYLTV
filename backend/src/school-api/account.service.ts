import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentStudent(accountId?: string) {
    const where = accountId ? { accountId } : undefined;
    const link = await this.prisma.studentAccount.findFirst({
      where,
      orderBy: [{ isActive: 'desc' }],
      include: { student: true },
    });

    if (!link) {
      throw new NotFoundException('Student account not found');
    }

    return this.toStudentProfile(link.student);
  }

  async getAccounts(accountId?: string) {
    const links = await this.prisma.studentAccount.findMany({
      where: accountId ? { accountId } : undefined,
      include: { account: true, student: true },
      orderBy: [{ isActive: 'desc' }, { student: { fullName: 'asc' } }],
    });

    return links.map((link) => ({
      account_id: link.accountId,
      student_id: link.studentId,
      student_name: link.student.fullName,
      student_code: link.student.code,
      class_name: link.student.className,
      grade: link.student.grade,
      avatar_url: link.student.avatarUrl,
      is_active: link.isActive,
    }));
  }

  async switchAccount(accountId: string, studentId: string) {
    const link = await this.prisma.studentAccount.findUnique({
      where: { accountId_studentId: { accountId, studentId } },
      include: { student: true },
    });

    if (!link) {
      throw new NotFoundException('Student account not found');
    }

    await this.prisma.$transaction([
      this.prisma.studentAccount.updateMany({
        where: { accountId },
        data: { isActive: false },
      }),
      this.prisma.studentAccount.update({
        where: { accountId_studentId: { accountId, studentId } },
        data: { isActive: true },
      }),
      this.prisma.account.update({
        where: { id: accountId },
        data: { activeStudentId: studentId },
      }),
    ]);

    return {
      access_token: 'auth-phase-not-implemented',
      student: {
        id: link.student.id,
        full_name: link.student.fullName,
        class_name: link.student.className,
      },
    };
  }

  private toStudentProfile(student: {
    id: string;
    code: string;
    fullName: string;
    avatarUrl: string | null;
    grade: string;
    className: string;
    schoolName: string;
  }) {
    return {
      id: student.id,
      code: student.code,
      full_name: student.fullName,
      avatar_url: student.avatarUrl,
      grade: student.grade,
      class_name: student.className,
      school_name: student.schoolName,
    };
  }
}
