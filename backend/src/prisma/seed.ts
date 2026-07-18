import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { seedIdentityAccess } from '../modules/identity-access/bootstrap/seed-identity-access';
import { seedAcademicContext } from '../modules/academics/bootstrap/seed-academic-context';
import { seedUatAccounts } from '../modules/identity-access/bootstrap/seed-uat-accounts';
import { createPrismaClientOptions } from './prisma-client-options';

async function main() {
  const username = process.env.BOOTSTRAP_ADMIN_USERNAME ?? 'admin';
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!password) {
    throw new Error('BOOTSTRAP_ADMIN_PASSWORD is required');
  }

  const prisma = new PrismaClient(createPrismaClientOptions());

  try {
    await seedIdentityAccess(prisma, { username, password });
    await seedAcademicContext(prisma);
    if (process.env.SEED_UAT_STUDENTS === 'true') {
      await seedUatStudents(prisma);
    }
    if (process.env.SEED_UAT_ACCOUNTS === 'true') {
      const accountPassword = process.env.UAT_ACCOUNT_PASSWORD ?? password;
      await seedUatAccounts(prisma, accountPassword);
    }
    if (process.env.SEED_UAT_ATTENDANCE === 'true') {
      await seedUatAttendance(prisma, username);
    }
    if (process.env.SEED_UAT_TUITION === 'true') {
      await seedUatTuition(prisma);
    }
    console.log('Identity & Access and Academic Context seed completed');
  } finally {
    await prisma.$disconnect();
  }
}

const uatStudents = [
  ['UAT-HS-001', 'Nguyễn Minh Anh', '6', '6A1', true, '2013-04-12', 'female'],
  ['UAT-HS-002', 'Trần Gia Bảo', '6', '6A2', true, '2013-08-23', 'male'],
  ['UAT-HS-003', 'Lê Hoàng Duy', '7', '7A1', true, '2012-01-17', 'male'],
  ['UAT-HS-004', 'Phạm Khánh Linh', '7', '7A2', true, '2012-11-05', 'female'],
  ['UAT-HS-005', 'Vũ Đức Anh', '8', '8A1', true, '2011-03-19', 'male'],
  ['UAT-HS-006', 'Đỗ Ngọc Mai', '8', '8A2', true, '2011-09-28', 'female'],
  ['UAT-HS-007', 'Bùi Quang Huy', '9', '9A1', false, '2010-06-14', 'male'],
  ['UAT-HS-008', 'Hoàng Thu Trang', '9', '9A2', true, '2010-12-02', 'female'],
] as const;

async function seedUatStudents(prisma: PrismaClient): Promise<void> {
  for (const [
    code,
    fullName,
    grade,
    className,
    isActive,
    birthDate,
    gender,
  ] of uatStudents) {
    const student = await prisma.student.upsert({
      where: { code },
      update: {
        fullName,
        grade,
        className,
        isActive,
        dateOfBirth: new Date(`${birthDate}T00:00:00.000Z`),
        gender,
        ethnicity: 'Kinh',
        birthPlace: 'Hà Nội',
        permanentAddress: 'Hà Nội',
        cohortStartYear: 2025,
        cohortEndYear: 2029,
      },
      create: {
        code,
        fullName,
        grade,
        className,
        isActive,
        schoolName: 'Trường THPT & THCS Lương Thế Vinh',
        dateOfBirth: new Date(`${birthDate}T00:00:00.000Z`),
        gender,
        ethnicity: 'Kinh',
        birthPlace: 'Hà Nội',
        permanentAddress: 'Hà Nội',
        cohortStartYear: 2025,
        cohortEndYear: 2029,
      },
      select: { id: true },
    });

    const guardianId = `uat-guardian-${code.toLowerCase()}`;
    await prisma.studentGuardianContact.upsert({
      where: { id: guardianId },
      update: {
        studentId: student.id,
        relationship: 'guardian',
        relationshipLabel: 'Người giám hộ',
        fullName: `Người giám hộ ${fullName}`,
        phone: '0900000000',
        isEmergencyContact: true,
      },
      create: {
        id: guardianId,
        studentId: student.id,
        relationship: 'guardian',
        relationshipLabel: 'Người giám hộ',
        fullName: `Người giám hộ ${fullName}`,
        phone: '0900000000',
        isEmergencyContact: true,
      },
    });
  }
}

async function seedUatAttendance(
  prisma: PrismaClient,
  username: string,
): Promise<void> {
  const [actor, semester, students] = await Promise.all([
    prisma.account.findUnique({ where: { username }, select: { id: true } }),
    prisma.semester.findFirst({
      where: { isCurrent: true },
      select: { id: true },
    }),
    prisma.student.findMany({
      where: { className: '6A1', isActive: true },
      orderBy: { code: 'asc' },
      select: { id: true },
    }),
  ]);
  if (!actor || !semester || students.length === 0) {
    throw new Error(
      'UAT attendance requires an admin, current semester, and active 6A1 students',
    );
  }
  const attendanceDate = new Date('2026-07-18T00:00:00.000Z');
  const session = await prisma.attendanceSession.upsert({
    where: {
      semesterId_attendanceDate_period_className: {
        semesterId: semester.id,
        attendanceDate,
        period: 'morning',
        className: '6A1',
      },
    },
    update: {},
    create: {
      semesterId: semester.id,
      attendanceDate,
      period: 'morning',
      className: '6A1',
      createdById: actor.id,
    },
    select: { id: true },
  });
  await prisma.$transaction(async (tx) => {
    await tx.attendanceRecord.deleteMany({ where: { sessionId: session.id } });
    await tx.attendanceRecord.createMany({
      data: students.map((student, index) => ({
        sessionId: session.id,
        studentId: student.id,
        status: index === 0 ? 'late' : 'present',
        note: index === 0 ? 'UAT: đến muộn 5 phút' : null,
        markedById: actor.id,
      })),
    });
  });
}

async function seedUatTuition(prisma: PrismaClient): Promise<void> {
  const [actor, semester, students] = await Promise.all([
    prisma.account.findUnique({
      where: { username: 'uat-admin' },
      select: { id: true },
    }),
    prisma.semester.findFirst({
      where: { isCurrent: true },
      select: { id: true },
    }),
    prisma.student.findMany({
      where: { code: { in: ['UAT-HS-001', 'UAT-HS-002'] }, isActive: true },
      orderBy: { code: 'asc' },
      select: { id: true },
    }),
  ]);
  if (!actor || !semester || students.length !== 2) {
    throw new Error(
      'UAT tuition requires uat-admin, current semester, and two active UAT students',
    );
  }
  for (const [index, student] of students.entries()) {
    await prisma.tuitionCharge.upsert({
      where: {
        studentId_semesterId_title: {
          studentId: student.id,
          semesterId: semester.id,
          title: 'Học phí học kỳ UAT',
        },
      },
      update: tuitionSeedData(actor.id, index),
      create: {
        studentId: student.id,
        semesterId: semester.id,
        title: 'Học phí học kỳ UAT',
        ...tuitionSeedData(actor.id, index),
      },
    });
  }
}

function tuitionSeedData(createdById: string, index: number) {
  const amountPaid = index === 0 ? 4_000_000 : 0;
  return {
    amountDue: 10_000_000,
    amountPaid,
    status: index === 0 ? ('partial' as const) : ('unpaid' as const),
    dueDate: new Date('2026-09-15T00:00:00.000Z'),
    note: 'Dữ liệu kiểm thử UAT',
    isWaived: false,
    createdById,
  };
}

void main();
