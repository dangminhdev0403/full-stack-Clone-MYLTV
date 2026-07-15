import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';
import type { AuthTokenService } from '../identity-access/auth-token.service';
import { StudentContextService } from './student-context.service';

type AuthTokenServiceMock = Pick<
  jest.Mocked<AuthTokenService>,
  'issueAccessToken'
>;

describe('StudentContextService', () => {
  it('lists linked active students for the current account', async () => {
    const { prisma } = prismaForLinks([linkRecord()]);
    const service = new StudentContextService(
      prisma as unknown as PrismaService,
      authTokenService().auth,
    );

    const result = await service.listLinkedStudentsForCurrentAccount(actor());

    expect(prisma.studentAccountLink.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          accountId: 'account-1',
          isActive: true,
          student: { isActive: true },
        },
      }),
    );
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        account_id: 'account-1',
        student_id: 'student-1',
        student_name: 'Nguyen Van A',
      }),
    );
  });

  it('switches active student only when linked and returns a token', async () => {
    const { prisma } = prismaForLinks([]);
    prisma.studentAccountLink.findFirst.mockResolvedValue(linkRecord());
    const { auth, issueAccessToken } = authTokenService();
    const service = new StudentContextService(
      prisma as unknown as PrismaService,
      auth,
    );

    const result = await service.switchActiveStudent(actor(), {
      account_id: 'account-1',
      student_id: 'student-1',
    });

    expect(issueAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({ activeStudentId: 'student-1' }),
    );
    expect(result.data.access_token).toBe('access-token');
    expect(result.data.student.id).toBe('student-1');
  });

  it('rejects missing users, mismatched accounts, and unlinked students', async () => {
    const { prisma } = prismaForLinks([]);
    prisma.studentAccountLink.findFirst.mockResolvedValue(null);
    const service = new StudentContextService(
      prisma as unknown as PrismaService,
      authTokenService().auth,
    );

    await expect(
      service.listLinkedStudentsForCurrentAccount(undefined),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      service.switchActiveStudent(actor(), {
        account_id: 'other',
        student_id: 'student-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.switchActiveStudent(actor(), { student_id: 'student-1' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('gets active student from token or falls back to a single linked student', async () => {
    const { prisma } = prismaForLinks([linkRecord()]);
    prisma.studentAccountLink.findFirst.mockResolvedValue(linkRecord());
    const service = new StudentContextService(
      prisma as unknown as PrismaService,
      authTokenService().auth,
    );

    const activeResult = await service.getCurrentStudent({
      ...actor(),
      activeStudentId: 'student-1',
    });
    expect(activeResult.data.id).toBe('student-1');

    const fallbackResult = await service.getCurrentStudent(actor());
    expect(fallbackResult.data.id).toBe('student-1');
  });
});

function actor() {
  return { id: 'account-1', username: 'parent', role: 'parent' as const };
}

function studentRecord() {
  const now = new Date('2026-07-13T00:00:00.000Z');
  return {
    id: 'student-1',
    code: 'S001',
    fullName: 'Nguyen Van A',
    avatarUrl: null,
    grade: '10',
    className: '10A1',
    schoolName: 'Luong The Vinh',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

function linkRecord() {
  return {
    accountId: 'account-1',
    studentId: 'student-1',
    student: studentRecord(),
  };
}

function authTokenService() {
  const auth: AuthTokenServiceMock = {
    issueAccessToken: jest.fn().mockResolvedValue('access-token'),
  };
  return {
    auth: auth as AuthTokenService,
    issueAccessToken: auth.issueAccessToken,
  };
}

function prismaForLinks(links: Array<ReturnType<typeof linkRecord>>) {
  const prisma = {
    student: {
      findUnique: jest.fn(),
    },
    studentAccountLink: {
      findMany: jest.fn().mockResolvedValue(links),
      findFirst: jest.fn(),
    },
  };
  return { prisma };
}
