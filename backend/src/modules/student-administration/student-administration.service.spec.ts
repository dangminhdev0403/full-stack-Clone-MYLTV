/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';
import { StudentAdministrationService } from './student-administration.service';
import type { StudentDetailDto } from './dto/student-administration.dto';

type GuardianContactRecord = {
  id: string;
  relationship:
    'father' | 'mother' | 'grandfather' | 'grandmother' | 'guardian' | 'other';
  relationshipLabel: string | null;
  fullName: string;
  phone: string;
  isEmergencyContact: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type StudentRecord = {
  id: string;
  code: string;
  fullName: string;
  avatarUrl: string | null;
  grade: string | null;
  className: string;
  schoolName: string | null;
  isActive: boolean;
  dateOfBirth?: Date | null;
  gender?: 'male' | 'female' | 'other' | null;
  ethnicity?: string | null;
  birthPlace?: string | null;
  permanentAddress?: string | null;
  cohortStartYear?: number | null;
  cohortEndYear?: number | null;
  guardianContacts?: GuardianContactRecord[];
  createdAt: Date;
  updatedAt: Date;
};
type StudentCreateResult = { id: string };
type AccountIdRecord = { id: string };
type StudentFindManyArgs = {
  where?: object;
  select?: object;
  orderBy?: object;
  skip?: number;
  take?: number;
};
type StudentCreateArgs = { data: object; select?: object };
type StudentUpdateArgs = {
  where: { id: string };
  data: object;
  select?: object;
};
type FindManyStudents = (args: StudentFindManyArgs) => Promise<StudentRecord[]>;
type CountStudents = (args: { where?: object }) => Promise<number>;
type FindUniqueStudent = (args: object) => Promise<StudentRecord | null>;
type CreateStudent = (args: StudentCreateArgs) => Promise<StudentCreateResult>;
type UpdateStudent = (args: StudentUpdateArgs) => Promise<StudentRecord>;
type DeleteStudentGuardianContacts = (
  args: object,
) => Promise<{ count: number }>;
type CreateStudentGuardianContacts = (
  args: object,
) => Promise<{ count: number }>;
type FindManyAccounts = (args: object) => Promise<AccountIdRecord[]>;
type DeleteStudentAccountLinks = (args: object) => Promise<{ count: number }>;
type CreateStudentAccountLinks = (args: object) => Promise<{ count: number }>;
type FindFirstStudentAccountLink = (args: object) => Promise<object | null>;
type PrismaMock = ReturnType<typeof prismaMock>;
type TransactionCallback = (tx: PrismaMock) => unknown;
type StudentDetailResponse = { data: StudentDetailDto };

describe('StudentAdministrationService', () => {
  it('lists students with filters, pagination, and snake_case mapping', async () => {
    const prisma = prismaMock();
    prisma.student.findMany.mockResolvedValue([studentRecord()]);
    prisma.student.count.mockResolvedValue(41);
    const service = new StudentAdministrationService(
      prisma as unknown as PrismaService,
    );

    const result = await service.listStudents({
      q: 'S001',
      grade: '10',
      class_name: '10A1',
      is_active: 'true',
      page: '2',
      page_size: '20',
    });

    const findManyArgs = firstMockArg(prisma.student.findMany);
    expect(findManyArgs).toMatchObject({
      where: { grade: '10', className: '10A1', isActive: true },
      skip: 20,
      take: 20,
    });
    expect(result.data.items[0]).toEqual(
      expect.objectContaining({
        full_name: 'Nguyen Van A',
        class_name: '10A1',
      }),
    );
    expect(result.data.has_next).toBe(true);
  });

  it('returns detail with personal profile and guardian contacts in snake_case', async () => {
    const prisma = prismaMock();
    prisma.student.findUnique.mockResolvedValueOnce(
      studentRecord({
        dateOfBirth: new Date('2011-05-15T00:00:00.000Z'),
        gender: 'male',
        ethnicity: 'Kinh',
        birthPlace: 'Ha Noi',
        permanentAddress: 'So 1 Pho Hue, Ha Noi',
        cohortStartYear: 2023,
        cohortEndYear: 2027,
        guardianContacts: [
          guardianContactRecord({
            id: 'guardian-contact-1',
            relationship: 'father',
            relationshipLabel: null,
            fullName: 'Nguyen Van B',
            phone: '0904 123 456',
            isEmergencyContact: true,
          }),
        ],
      }),
    );
    const service = new StudentAdministrationService(
      prisma as unknown as PrismaService,
    );

    const result = (await service.getStudent(
      'student-1',
    )) as StudentDetailResponse;

    expect(result.data).toEqual(
      expect.objectContaining({
        id: 'student-1',
        date_of_birth: '2011-05-15',
        gender: 'male',
        ethnicity: 'Kinh',
        birth_place: 'Ha Noi',
        permanent_address: 'So 1 Pho Hue, Ha Noi',
        cohort_start_year: 2023,
        cohort_end_year: 2027,
        guardian_contacts: [
          expect.objectContaining({
            id: 'guardian-contact-1',
            relationship: 'father',
            relationship_label: null,
            full_name: 'Nguyen Van B',
            phone: '0904 123 456',
            is_emergency_contact: true,
          }),
        ],
      }),
    );
    expect(firstMockArg(prisma.student.findUnique)).toMatchObject({
      include: {
        guardianContacts: {
          orderBy: [{ isEmergencyContact: 'desc' }, { createdAt: 'asc' }],
        },
      },
    });
  });

  it('returns detail and throws not found for missing students', async () => {
    const prisma = prismaMock();
    prisma.student.findUnique.mockResolvedValueOnce(studentRecord());
    const service = new StudentAdministrationService(
      prisma as unknown as PrismaService,
    );

    const result = (await service.getStudent(
      'student-1',
    )) as StudentDetailResponse;
    expect(result.data.id).toBe('student-1');

    prisma.student.findUnique.mockResolvedValueOnce(null);
    await expect(service.getStudent('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates students with guardian links transactionally', async () => {
    const prisma = prismaMock();
    prisma.account.findMany.mockResolvedValue([{ id: 'account-1' }]);
    prisma.$transaction.mockImplementation((callback: TransactionCallback) =>
      Promise.resolve(callback(prisma)),
    );
    prisma.student.create.mockResolvedValue({ id: 'student-1' });
    prisma.student.findUnique.mockResolvedValue(studentRecord());
    const service = new StudentAdministrationService(
      prisma as unknown as PrismaService,
    );

    await service.createStudent(
      {
        code: 'S001',
        full_name: 'Nguyen Van A',
        class_name: '10A1',
        guardian_account_ids: ['account-1', 'account-1'],
      },
      adminActor(),
    );

    const createArgs = firstMockArg(prisma.student.create);
    expect(createArgs).toMatchObject({
      data: { code: 'S001', fullName: 'Nguyen Van A', className: '10A1' },
    });
    expect(prisma.studentAccountLink.createMany).toHaveBeenCalledWith({
      data: [
        {
          studentId: 'student-1',
          accountId: 'account-1',
          relationship: 'guardian',
        },
      ],
      skipDuplicates: true,
    });
  });

  it('rejects non-admin mutation, missing fields, invalid accounts, and duplicate codes', async () => {
    const prisma = prismaMock();
    const service = new StudentAdministrationService(
      prisma as unknown as PrismaService,
    );

    await expect(
      service.createStudent(
        { code: 'S001' },
        { ...adminActor(), role: 'teacher' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    await expect(
      service.createStudent({ code: 'S001' }, adminActor()),
    ).rejects.toBeInstanceOf(BadRequestException);

    prisma.account.findMany.mockResolvedValue([]);
    await expect(
      service.createStudent(
        {
          code: 'S001',
          full_name: 'Nguyen Van A',
          class_name: '10A1',
          guardian_account_ids: ['missing'],
        },
        adminActor(),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    prisma.$transaction.mockRejectedValue({ code: 'P2002' });
    await expect(
      service.createStudent(
        { code: 'S001', full_name: 'Nguyen Van A', class_name: '10A1' },
        adminActor(),
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('updates only provided student fields', async () => {
    const prisma = prismaMock();
    prisma.student.findUnique.mockResolvedValue(studentRecord());
    prisma.student.update.mockResolvedValue(
      studentRecord({ fullName: 'Updated' }),
    );
    const service = new StudentAdministrationService(
      prisma as unknown as PrismaService,
    );

    const result = await service.updateStudent(
      'student-1',
      { full_name: 'Updated' },
      adminActor(),
    );

    expect(prisma.student.update).toHaveBeenCalledWith({
      where: { id: 'student-1' },
      data: { fullName: 'Updated' },
      select: {
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
      },
    });
    expect(result.data.full_name).toBe('Updated');
  });

  it('updates profile and replaces guardian contacts in one transaction without touching account links', async () => {
    const prisma = prismaMock();
    prisma.student.findUnique.mockResolvedValue(studentRecord());
    prisma.$transaction.mockImplementation((callback: TransactionCallback) =>
      Promise.resolve(callback(prisma)),
    );
    prisma.student.update.mockResolvedValue(
      studentRecord({
        dateOfBirth: new Date('2011-05-15T00:00:00.000Z'),
        gender: 'female',
        ethnicity: 'Kinh',
        birthPlace: 'Ha Noi',
        permanentAddress: 'So 2 Nguyen Trai, Ha Noi',
        cohortStartYear: 2023,
        cohortEndYear: 2027,
        guardianContacts: [
          guardianContactRecord({
            relationship: 'mother',
            fullName: 'Tran Thi C',
          }),
        ],
      }),
    );
    const service = new StudentAdministrationService(
      prisma as unknown as PrismaService,
    );

    await service.updateStudent(
      'student-1',
      {
        date_of_birth: '2011-05-15',
        gender: 'female',
        ethnicity: ' Kinh ',
        birth_place: 'Ha Noi',
        permanent_address: 'So 2 Nguyen Trai, Ha Noi',
        cohort_start_year: 2023,
        cohort_end_year: 2027,
        guardian_contacts: [
          {
            relationship: 'mother',
            relationship_label: null,
            full_name: 'Tran Thi C',
            phone: '0988 000 111',
            is_emergency_contact: true,
          },
        ],
      },
      adminActor(),
    );

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.student.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'student-1' },
        data: expect.objectContaining({
          dateOfBirth: new Date('2011-05-15T00:00:00.000Z'),
          gender: 'female',
          ethnicity: 'Kinh',
          birthPlace: 'Ha Noi',
          permanentAddress: 'So 2 Nguyen Trai, Ha Noi',
          cohortStartYear: 2023,
          cohortEndYear: 2027,
        }),
      }),
    );
    expect(prisma.studentGuardianContact.deleteMany).toHaveBeenCalledWith({
      where: { studentId: 'student-1' },
    });
    expect(prisma.studentGuardianContact.createMany).toHaveBeenCalledWith({
      data: [
        {
          studentId: 'student-1',
          relationship: 'mother',
          relationshipLabel: null,
          fullName: 'Tran Thi C',
          phone: '0988 000 111',
          isEmergencyContact: true,
        },
      ],
    });
    expect(prisma.studentAccountLink.deleteMany).not.toHaveBeenCalled();
    expect(prisma.studentAccountLink.createMany).not.toHaveBeenCalled();
  });

  it('replaces guardian links without deleting other relationship links', async () => {
    const prisma = prismaMock();
    prisma.student.findUnique.mockResolvedValue(studentRecord());
    prisma.account.findMany.mockResolvedValue([{ id: 'account-2' }]);
    prisma.$transaction.mockImplementation((callback: TransactionCallback) =>
      Promise.resolve(callback(prisma)),
    );
    const service = new StudentAdministrationService(
      prisma as unknown as PrismaService,
    );

    const result = await service.replaceStudentAccounts(
      'student-1',
      { account_ids: ['account-2'] },
      adminActor(),
    );

    expect(prisma.studentAccountLink.deleteMany).toHaveBeenCalledWith({
      where: { studentId: 'student-1', relationship: 'guardian' },
    });
    expect(prisma.studentAccountLink.createMany).toHaveBeenCalled();
    expect(result.data.updated).toBe(true);
  });
});

function studentRecord(overrides: Partial<StudentRecord> = {}): StudentRecord {
  const now = new Date('2026-07-13T00:00:00.000Z');
  return {
    id: 'student-1',
    code: 'S001',
    fullName: 'Nguyen Van A',
    avatarUrl: null,
    grade: '10',
    className: '10A1',
    schoolName: 'Sổ Liên Lạc Điện Tử',
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function guardianContactRecord(
  overrides: Partial<GuardianContactRecord> = {},
): GuardianContactRecord {
  const now = new Date('2026-07-13T00:00:00.000Z');
  return {
    id: 'guardian-contact-1',
    relationship: 'guardian',
    relationshipLabel: null,
    fullName: 'Nguyen Van B',
    phone: '0904 123 456',
    isEmergencyContact: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function adminActor() {
  return { id: 'admin-1', username: 'admin', role: 'admin' as const };
}

function prismaMock() {
  const transaction = jest.fn<
    Promise<unknown>,
    [callback: TransactionCallback]
  >();
  return {
    $transaction: transaction,
    student: {
      findMany: jest.fn<
        ReturnType<FindManyStudents>,
        Parameters<FindManyStudents>
      >(),
      count: jest.fn<ReturnType<CountStudents>, Parameters<CountStudents>>(),
      findUnique: jest.fn<
        ReturnType<FindUniqueStudent>,
        Parameters<FindUniqueStudent>
      >(),
      create: jest.fn<ReturnType<CreateStudent>, Parameters<CreateStudent>>(),
      update: jest.fn<ReturnType<UpdateStudent>, Parameters<UpdateStudent>>(),
    },
    studentAccountLink: {
      findFirst: jest.fn<
        ReturnType<FindFirstStudentAccountLink>,
        Parameters<FindFirstStudentAccountLink>
      >(),
      deleteMany: jest.fn<
        ReturnType<DeleteStudentAccountLinks>,
        Parameters<DeleteStudentAccountLinks>
      >(),
      createMany: jest.fn<
        ReturnType<CreateStudentAccountLinks>,
        Parameters<CreateStudentAccountLinks>
      >(),
    },
    studentGuardianContact: {
      deleteMany: jest.fn<
        ReturnType<DeleteStudentGuardianContacts>,
        Parameters<DeleteStudentGuardianContacts>
      >(),
      createMany: jest.fn<
        ReturnType<CreateStudentGuardianContacts>,
        Parameters<CreateStudentGuardianContacts>
      >(),
    },
    account: {
      findMany: jest.fn<
        ReturnType<FindManyAccounts>,
        Parameters<FindManyAccounts>
      >(),
    },
  };
}

function firstMockArg<TArgs extends [unknown, ...unknown[]], TResult>(
  mock: jest.Mock<TResult, TArgs>,
): TArgs[0] {
  const args = mock.mock.calls[0];
  if (!args) {
    throw new Error('Expected mock to be called');
  }
  return args[0];
}
