import 'dotenv/config';
import { AttendanceStatus, PrismaClient } from '@prisma/client';
import { seedIdentityAccess } from '../modules/identity-access/bootstrap/seed-identity-access';
import { seedAcademicContext } from '../modules/academics/bootstrap/seed-academic-context';
import { seedUatAccounts } from '../modules/identity-access/bootstrap/seed-uat-accounts';
import { createPrismaClientOptions } from './prisma-client-options';

async function main() {
  const username = process.env.BOOTSTRAP_ADMIN_USERNAME ?? 'admin';
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? 'admin123';

  const prisma = new PrismaClient(createPrismaClientOptions());

  try {
    console.log('🌱 Starting database seeding...');
    await seedIdentityAccess(prisma, { username, password });
    await seedDynamicRoles(prisma);
    await seedAcademicContext(prisma);
    await seedAcademicStructure(prisma);
    await seedUatStudents(prisma);
    const accountPassword =
      process.env.UAT_ACCOUNT_PASSWORD ?? 'password123456';
    await seedUatAccounts(prisma, accountPassword);
    await seedUatAttendance(prisma, username);
    await seedUatTuition(prisma);
    await seedNewsAndNotifications(prisma);
    await seedStudentServices(prisma);

    console.log('✅ All Database Seed Data Inserted Successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

import { PERMISSIONS } from '../modules/identity-access/permissions/permission.registry';

async function seedDynamicRoles(prisma: PrismaClient): Promise<void> {
  const builtInRoles = [
    {
      id: 'role-super-admin',
      code: 'super_admin',
      name: 'Super Admin',
      description: 'Built-in Super Administrator role',
      isSystem: true,
      isActive: true,
    },
    {
      id: 'role-admin',
      code: 'admin',
      name: 'Administrator',
      description: 'Built-in Administrator role',
      isSystem: true,
      isActive: true,
    },
    {
      id: 'role-teacher',
      code: 'teacher',
      name: 'Teacher',
      description: 'Built-in Teacher role',
      isSystem: true,
      isActive: true,
    },
    {
      id: 'role-student',
      code: 'student',
      name: 'Student',
      description: 'Built-in Student role',
      isSystem: true,
      isActive: true,
    },
    {
      id: 'role-parent',
      code: 'parent',
      name: 'Parent',
      description: 'Built-in Parent role',
      isSystem: true,
      isActive: true,
    },
  ];

  for (const roleDef of builtInRoles) {
    await prisma.role.upsert({
      where: { code: roleDef.code },
      update: {
        name: roleDef.name,
        description: roleDef.description,
        isSystem: true,
        isActive: true,
      },
      create: roleDef,
    });
  }

  const superAdminRole = await prisma.role.findUnique({
    where: { code: 'super_admin' },
    select: { id: true },
  });

  if (superAdminRole) {
    for (const permission of PERMISSIONS) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionKey: {
            roleId: superAdminRole.id,
            permissionKey: permission.key,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionKey: permission.key,
        },
      });
    }
  }

  const allAccounts = await prisma.account.findMany({
    select: { id: true, role: true },
  });

  const allRoles = await prisma.role.findMany({
    select: { id: true, code: true },
  });

  const roleMap = new Map(allRoles.map((r) => [r.code, r.id]));

  for (const account of allAccounts) {
    const roleId = roleMap.get(account.role);
    if (roleId) {
      await prisma.accountRoleAssignment.upsert({
        where: {
          accountId_roleId: {
            accountId: account.id,
            roleId,
          },
        },
        update: {},
        create: {
          accountId: account.id,
          roleId,
        },
      });
    }
  }
}

const uatStudents = [
  ['UAT-HS-001', 'Nguyễn Minh Anh', '6', '6A1', true, '2013-04-12', 'female'],
  ['UAT-HS-002', 'Trần Gia Bảo', '6', '6A2', true, '2013-08-23', 'male'],
  ['UAT-HS-003', 'Lê Hoàng Duy', '7', '7A1', true, '2012-01-17', 'male'],
  ['UAT-HS-004', 'Phạm Khánh Linh', '7', '7A2', true, '2012-11-05', 'female'],
  ['UAT-HS-005', 'Vũ Đức Anh', '8', '8A1', true, '2011-03-19', 'male'],
  ['UAT-HS-006', 'Đỗ Ngọc Mai', '8', '8A2', true, '2011-09-28', 'female'],
  ['UAT-HS-007', 'Bùi Quang Huy', '9', '9A1', true, '2010-06-14', 'male'],
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
        schoolName: 'Sổ Liên Lạc Điện Tử',
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
        schoolName: 'Sổ Liên Lạc Điện Tử',
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

    const currentAcademicYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
      select: { id: true, startsOn: true },
    });

    if (currentAcademicYear) {
      const targetClass = await prisma.schoolClass.findUnique({
        where: {
          academicYearId_code: {
            academicYearId: currentAcademicYear.id,
            code: className,
          },
        },
        select: { id: true },
      });

      if (targetClass) {
        const existingActiveEnrollment = await prisma.classEnrollment.findFirst(
          {
            where: {
              studentId: student.id,
              isActive: true,
            },
            select: { id: true, classId: true },
          },
        );

        if (existingActiveEnrollment) {
          if (existingActiveEnrollment.classId !== targetClass.id) {
            await prisma.classEnrollment.update({
              where: { id: existingActiveEnrollment.id },
              data: { isActive: false, endsOn: new Date() },
            });
            await prisma.classEnrollment.create({
              data: {
                id: `enrollment-${student.id}-${targetClass.id}`,
                studentId: student.id,
                classId: targetClass.id,
                startsOn: currentAcademicYear.startsOn,
                isActive,
              },
            });
          }
        } else {
          const enrollmentId = `enrollment-${student.id}-${targetClass.id}`;
          await prisma.classEnrollment.upsert({
            where: { id: enrollmentId },
            update: {
              isActive,
              startsOn: currentAcademicYear.startsOn,
            },
            create: {
              id: enrollmentId,
              studentId: student.id,
              classId: targetClass.id,
              startsOn: currentAcademicYear.startsOn,
              isActive,
            },
          });
        }
      }
    }
  }
}

async function seedAcademicStructure(prisma: PrismaClient): Promise<void> {
  const gradeLevelsData = [
    { id: 'grade-level-6', code: '6', displayName: 'Khối 6', sortOrder: 6 },
    { id: 'grade-level-7', code: '7', displayName: 'Khối 7', sortOrder: 7 },
    { id: 'grade-level-8', code: '8', displayName: 'Khối 8', sortOrder: 8 },
    { id: 'grade-level-9', code: '9', displayName: 'Khối 9', sortOrder: 9 },
  ];

  for (const level of gradeLevelsData) {
    await prisma.gradeLevel.upsert({
      where: { code: level.code },
      update: {
        displayName: level.displayName,
        sortOrder: level.sortOrder,
      },
      create: {
        id: level.id,
        code: level.code,
        displayName: level.displayName,
        sortOrder: level.sortOrder,
      },
    });
  }

  const currentAcademicYear = await prisma.academicYear.findFirst({
    where: { isCurrent: true },
    select: { id: true, startsOn: true },
  });

  if (!currentAcademicYear) return;

  const classesData = [
    { code: '6A1', gradeCode: '6', displayName: 'Lớp 6A1' },
    { code: '6A2', gradeCode: '6', displayName: 'Lớp 6A2' },
    { code: '7A1', gradeCode: '7', displayName: 'Lớp 7A1' },
    { code: '7A2', gradeCode: '7', displayName: 'Lớp 7A2' },
    { code: '8A1', gradeCode: '8', displayName: 'Lớp 8A1' },
    { code: '8A2', gradeCode: '8', displayName: 'Lớp 8A2' },
    { code: '9A1', gradeCode: '9', displayName: 'Lớp 9A1' },
    { code: '9A2', gradeCode: '9', displayName: 'Lớp 9A2' },
  ];

  for (const cls of classesData) {
    const gradeLevel = await prisma.gradeLevel.findUnique({
      where: { code: cls.gradeCode },
      select: { id: true },
    });
    if (!gradeLevel) continue;

    await prisma.schoolClass.upsert({
      where: {
        academicYearId_code: {
          academicYearId: currentAcademicYear.id,
          code: cls.code,
        },
      },
      update: {
        gradeLevelId: gradeLevel.id,
        displayName: cls.displayName,
        isActive: true,
      },
      create: {
        id: `school-class-${currentAcademicYear.id}-${cls.code}`,
        academicYearId: currentAcademicYear.id,
        gradeLevelId: gradeLevel.id,
        code: cls.code,
        displayName: cls.displayName,
        isActive: true,
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
  if (!actor || !semester || students.length === 0) return;

  const fixtureSessions: Array<{
    dateStr: string;
    getStatus: (index: number) => {
      status: AttendanceStatus;
      note: string | null;
    };
  }> = [
    {
      dateStr: '2026-07-18T00:00:00.000Z',
      getStatus: (index: number) =>
        index === 0
          ? { status: 'late', note: 'Đến muộn 5 phút' }
          : { status: 'present', note: null },
    },
    {
      dateStr: '2026-07-19T00:00:00.000Z',
      getStatus: (index: number) => {
        if (index === 0) return { status: 'present', note: null };
        if (index === 1)
          return { status: 'absent', note: 'Nghỉ học không lý do' };
        if (index === 2)
          return { status: 'excused', note: 'Nghỉ học có phép (ốm)' };
        return { status: 'present', note: null };
      },
    },
    {
      dateStr: '2026-07-20T00:00:00.000Z',
      getStatus: (index: number) =>
        index === 0
          ? { status: 'absent', note: 'Nghỉ học không lý do' }
          : { status: 'present', note: null },
    },
    {
      dateStr: '2026-07-21T00:00:00.000Z',
      getStatus: () => ({ status: 'present', note: null }),
    },
  ];

  for (const fixture of fixtureSessions) {
    const attendanceDate = new Date(fixture.dateStr);
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
      await tx.attendanceRecord.deleteMany({
        where: { sessionId: session.id },
      });
      await tx.attendanceRecord.createMany({
        data: students.map((student, index) => {
          const { status, note } = fixture.getStatus(index);
          return {
            sessionId: session.id,
            studentId: student.id,
            status,
            note,
            markedById: actor.id,
          };
        }),
      });
    });
  }
}

async function seedUatTuition(prisma: PrismaClient): Promise<void> {
  const [actor, semester, students] = await Promise.all([
    prisma.account.findFirst({ select: { id: true } }),
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
  if (!actor || !semester || students.length === 0) return;

  for (const [index, student] of students.entries()) {
    await prisma.tuitionCharge.upsert({
      where: {
        studentId_semesterId_title: {
          studentId: student.id,
          semesterId: semester.id,
          title: 'Học phí Học kỳ 1',
        },
      },
      update: tuitionSeedData(actor.id, index),
      create: {
        studentId: student.id,
        semesterId: semester.id,
        title: 'Học phí Học kỳ 1',
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
    note: 'Hạn nộp học phí đầu năm',
    isWaived: false,
    createdById,
  };
}

async function seedNewsAndNotifications(prisma: PrismaClient): Promise<void> {
  const admin = await prisma.account.findFirst({ select: { id: true } });
  if (!admin) return;

  // News 1: Event Announcement
  await prisma.newsItem.upsert({
    where: { id: 'news-sample-1' },
    update: {
      title: 'Lễ Khai Giảng Trọng Thể Năm Học Mới 2026-2027',
      summary:
        'Trường Trung Học phổ thông trọng thể tổ chức Lễ Khai Giảng Năm Học 2026-2027 dành cho toàn thể học sinh và phụ huynh.',
      content:
        'Nhà trường trân trọng kính mời Quý phụ huynh, các thầy cô giáo cùng toàn thể các em học sinh tới tham dự Lễ Khai Giảng Năm Học Mới 2026-2027.\n\n⏰ Thời gian: 07h30 - 10h30, Thứ Sáu ngày 05/09/2026.\n📍 Địa điểm: Sân trường chính - Khuôn viên nhà trường.\n👗 Trang phục: Học sinh mặc đồng phục chính thức (áo sơ mi trắng, quần/chân váy tối màu, đeo khăn quàng/cà vạt).\n\nChương trình gồm các hoạt động:\n- Lễ chào cờ & Hát Quốc ca trọng thể\n- Đọc thư mừng năm học mới của Chủ tịch nước\n- Tiếng trống khai trường chào đón năm học mới\n- Văn nghệ chào mừng đặc sắc từ các câu lạc bộ học sinh.',
      imageUrl:
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop',
      category: 'Sự kiện',
      status: 'published',
      isPinned: true,
      publishedAt: new Date('2026-07-20T08:00:00Z'),
      createdById: admin.id,
    },
    create: {
      id: 'news-sample-1',
      title: 'Lễ Khai Giảng Trọng Thể Năm Học Mới 2026-2027',
      summary:
        'Trường Trung Học phổ thông trọng thể tổ chức Lễ Khai Giảng Năm Học 2026-2027 dành cho toàn thể học sinh và phụ huynh.',
      content:
        'Nhà trường trân trọng kính mời Quý phụ huynh, các thầy cô giáo cùng toàn thể các em học sinh tới tham dự Lễ Khai Giảng Năm Học Mới 2026-2027.\n\n⏰ Thời gian: 07h30 - 10h30, Thứ Sáu ngày 05/09/2026.\n📍 Địa điểm: Sân trường chính - Khuôn viên nhà trường.\n👗 Trang phục: Học sinh mặc đồng phục chính thức (áo sơ mi trắng, quần/chân váy tối màu, đeo khăn quàng/cà vạt).\n\nChương trình gồm các hoạt động:\n- Lễ chào cờ & Hát Quốc ca trọng thể\n- Đọc thư mừng năm học mới của Chủ tịch nước\n- Tiếng trống khai trường chào đón năm học mới\n- Văn nghệ chào mừng đặc sắc từ các câu lạc bộ học sinh.',
      imageUrl:
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop',
      category: 'Sự kiện',
      status: 'published',
      isPinned: true,
      publishedAt: new Date('2026-07-20T08:00:00Z'),
      createdById: admin.id,
    },
  });

  // News 2: Academic Timetable Announcement
  await prisma.newsItem.upsert({
    where: { id: 'news-sample-2' },
    update: {
      title: 'Thông Báo Lịch Học Kỳ 1 & Thời Khóa Biểu Chính Thức',
      summary:
        'Lịch học chính thức và thời khóa biểu toàn bộ các khối lớp áp dụng từ tuần thứ nhất của năm học mới.',
      content:
        'Ban Giám hiệu nhà trường xin thông báo thời khóa biểu chính thức Kỳ 1 Năm học 2026-2027 đã được hoàn tất và cập nhật trên Sổ Liên Lạc Điện Tử.\n\n📌 Quý phụ huynh và các em học sinh có thể theo dõi thời khóa biểu chi tiết từng ngày tại mục "Thời khóa biểu" trên ứng dụng.\n📌 Thời gian học sinh có mặt tại trường: Buổi sáng từ 07h15, Buổi chiều từ 13h45.\n📌 Trường hợp học sinh nghỉ học có lý do, Quý phụ huynh vui lòng gửi đơn xin nghỉ phép qua ứng dụng trước 07h30 sáng cùng ngày.',
      imageUrl:
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop',
      category: 'Thông báo',
      status: 'published',
      isPinned: false,
      publishedAt: new Date('2026-07-22T09:30:00Z'),
      createdById: admin.id,
    },
    create: {
      id: 'news-sample-2',
      title: 'Thông Báo Lịch Học Kỳ 1 & Thời Khóa Biểu Chính Thức',
      summary:
        'Lịch học chính thức và thời khóa biểu toàn bộ các khối lớp áp dụng từ tuần thứ nhất của năm học mới.',
      content:
        'Ban Giám hiệu nhà trường xin thông báo thời khóa biểu chính thức Kỳ 1 Năm học 2026-2027 đã được hoàn tất và cập nhật trên Sổ Liên Lạc Điện Tử.\n\n📌 Quý phụ huynh và các em học sinh có thể theo dõi thời khóa biểu chi tiết từng ngày tại mục "Thời khóa biểu" trên ứng dụng.\n📌 Thời gian học sinh có mặt tại trường: Buổi sáng từ 07h15, Buổi chiều từ 13h45.\n📌 Trường hợp học sinh nghỉ học có lý do, Quý phụ huynh vui lòng gửi đơn xin nghỉ phép qua ứng dụng trước 07h30 sáng cùng ngày.',
      imageUrl:
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop',
      category: 'Thông báo',
      status: 'published',
      isPinned: false,
      publishedAt: new Date('2026-07-22T09:30:00Z'),
      createdById: admin.id,
    },
  });

  // News 3: Extracurricular & Sports Announcement
  await prisma.newsItem.upsert({
    where: { id: 'news-sample-3' },
    update: {
      title: 'Đăng Ký Câu Lạc Bộ Ngoại Khóa & Hội Thao Thể Dục Thể Thao 2026',
      summary:
        'Mở đơn đăng ký tham gia các CLB kỹ năng, nghệ thuật, thể thao và Hội thao chào mừng mùa thu năm 2026.',
      content:
        'Nhằm tạo sân chơi lành mạnh, phát triển toàn diện thể chất và năng khiếu cho học sinh, nhà trường chính thức mở cổng đăng ký tham gia các Câu lạc bộ ngoại khóa và Hội thao học sinh 2026.\n\n🏆 Danh sách Câu lạc bộ mở tuyển sinh mùa thu:\n- CLB STEM & Robotics (Lập trình & Mô hình sáng tạo)\n- CLB Bóng Đá, Bóng Rổ & Cầu Lông\n- CLB Nghệ Thuật & Âm Nhạc\n\n📅 Thời gian đăng ký: Từ 26/07/2026 đến hết 15/08/2026.\nLink đăng ký và thông tin lệ phí xin xem chi tiết tại mục "Dịch vụ học sinh > Câu lạc bộ" trên hệ thống.',
      imageUrl:
        'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200&auto=format&fit=crop',
      category: 'Tin tức',
      status: 'published',
      isPinned: false,
      publishedAt: new Date('2026-07-25T14:00:00Z'),
      createdById: admin.id,
    },
    create: {
      id: 'news-sample-3',
      title: 'Đăng Ký Câu Lạc Bộ Ngoại Khóa & Hội Thao Thể Dục Thể Thao 2026',
      summary:
        'Mở đơn đăng ký tham gia các CLB kỹ năng, nghệ thuật, thể thao và Hội thao chào mừng mùa thu năm 2026.',
      content:
        'Nhằm tạo sân chơi lành mạnh, phát triển toàn diện thể chất và năng khiếu cho học sinh, nhà trường chính thức mở cổng đăng ký tham gia các Câu lạc bộ ngoại khóa và Hội thao học sinh 2026.\n\n🏆 Danh sách Câu lạc bộ mở tuyển sinh mùa thu:\n- CLB STEM & Robotics (Lập trình & Mô hình sáng tạo)\n- CLB Bóng Đá, Bóng Rổ & Cầu Lông\n- CLB Nghệ Thuật & Âm Nhạc\n\n📅 Thời gian đăng ký: Từ 26/07/2026 đến hết 15/08/2026.\nLink đăng ký và thông tin lệ phí xin xem chi tiết tại mục "Dịch vụ học sinh > Câu lạc bộ" trên hệ thống.',
      imageUrl:
        'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200&auto=format&fit=crop',
      category: 'Tin tức',
      status: 'published',
      isPinned: false,
      publishedAt: new Date('2026-07-25T14:00:00Z'),
      createdById: admin.id,
    },
  });

  // News 4: Draft Announcement
  await prisma.newsItem.upsert({
    where: { id: 'news-sample-4' },
    update: {
      title:
        'Dự Thảo Quy Định Sử Dụng Thiết Bị Điện Tử & Điện Thoại Trong Lớp Học',
      summary:
        'Bản thảo lấy ý kiến phụ huynh và giáo viên về quy định quản lý thiết bị công nghệ trong giờ học.',
      content:
        'Nhà trường đang xây dựng dự thảo quy chế sử dụng điện thoại thông minh và máy tính bảng trong khuôn viên trường học nhằm nâng cao mức độ tập trung cho học sinh.',
      imageUrl:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
      category: 'Thông báo',
      status: 'draft',
      isPinned: false,
      publishedAt: null,
      createdById: admin.id,
    },
    create: {
      id: 'news-sample-4',
      title:
        'Dự Thảo Quy Định Sử Dụng Thiết Bị Điện Tử & Điện Thoại Trong Lớp Học',
      summary:
        'Bản thảo lấy ý kiến phụ huynh và giáo viên về quy định quản lý thiết bị công nghệ trong giờ học.',
      content:
        'Nhà trường đang xây dựng dự thảo quy chế sử dụng điện thoại thông minh và máy tính bảng trong khuôn viên trường học nhằm nâng cao mức độ tập trung cho học sinh.',
      imageUrl:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
      category: 'Thông báo',
      status: 'draft',
      isPinned: false,
      publishedAt: null,
      createdById: admin.id,
    },
  });

  // Notification
  await prisma.notification.upsert({
    where: { id: 'notif-sample-1' },
    update: {
      title: 'Nhắc nhở đóng học phí Kỳ 1',
      sender: 'Phòng Tài Chính',
      content:
        'Kính mời phụ huynh kiểm tra thông tin khoản thu và hoàn tất đóng học phí trước ngày 15/09/2026.',
      tag: 'Học phí',
    },
    create: {
      id: 'notif-sample-1',
      title: 'Nhắc nhở đóng học phí Kỳ 1',
      sender: 'Phòng Tài Chính',
      content:
        'Kính mời phụ huynh kiểm tra thông tin khoản thu và hoàn tất đóng học phí trước ngày 15/09/2026.',
      tag: 'Học phí',
    },
  });

  // FeedbackItem
  await prisma.feedbackItem.upsert({
    where: { id: 'feedback-sample-1' },
    update: {
      title: 'Góp ý chất lượng thực đơn bán trú',
      content:
        'Mong nhà trường bổ sung thêm trái cây và rau xanh trong bữa trưa.',
      category: 'Bán trú',
      status: 'new',
    },
    create: {
      id: 'feedback-sample-1',
      title: 'Góp ý chất lượng thực đơn bán trú',
      content:
        'Mong nhà trường bổ sung thêm trái cây và rau xanh trong bữa trưa.',
      category: 'Bán trú',
      status: 'new',
    },
  });
}

async function seedStudentServices(prisma: PrismaClient): Promise<void> {
  const student = await prisma.student.findFirst({
    where: { code: 'UAT-HS-001' },
  });
  const semester = await prisma.semester.findFirst({
    where: { isCurrent: true },
  });
  if (!student || !semester) return;

  // MealRegistration
  await prisma.mealRegistration.upsert({
    where: {
      studentId_date: {
        studentId: student.id,
        date: new Date('2026-07-25T00:00:00Z'),
      },
    },
    update: {
      breakfast: 'Phở bò Hà Nội',
      lunch: 'Cơm sườn nướng, canh rau cải, chuối chín',
      snack: 'Sữa tươi & Bánh su kem',
      status: 'registered',
    },
    create: {
      studentId: student.id,
      date: new Date('2026-07-25T00:00:00Z'),
      breakfast: 'Phở bò Hà Nội',
      lunch: 'Cơm sườn nướng, canh rau cải, chuối chín',
      snack: 'Sữa tươi & Bánh su kem',
      status: 'registered',
    },
  });

  // SchoolEvent
  await prisma.schoolEvent.upsert({
    where: { id: 'event-sample-1' },
    update: {
      title: 'Hội Thao Học Sinh 2026',
      description: 'Giải thi đấu bóng đá, cầu lông và điền kinh toàn trường.',
      startAt: new Date('2026-10-10T08:00:00Z'),
      endAt: new Date('2026-10-12T17:00:00Z'),
      location: 'Sân vận động nhà trường',
      status: 'open',
    },
    create: {
      id: 'event-sample-1',
      title: 'Hội Thao Học Sinh 2026',
      description: 'Giải thi đấu bóng đá, cầu lông và điền kinh toàn trường.',
      startAt: new Date('2026-10-10T08:00:00Z'),
      endAt: new Date('2026-10-12T17:00:00Z'),
      location: 'Sân vận động nhà trường',
      status: 'open',
    },
  });

  // SchoolClub
  await prisma.schoolClub.upsert({
    where: { id: 'club-sample-1' },
    update: {
      name: 'Câu Lạc Bộ STEM & Robotics',
      description: 'Lập trình robot, trải nghiệm mô hình khoa học sáng tạo.',
      teacher: 'Thầy Nguyễn Văn Nam',
      schedule: 'Chiều thứ 5 hàng tuần (16h00 - 17h30)',
      location: 'Phòng Lab 3',
      fee: 200000,
      status: 'open',
    },
    create: {
      id: 'club-sample-1',
      name: 'Câu Lạc Bộ STEM & Robotics',
      description: 'Lập trình robot, trải nghiệm mô hình khoa học sáng tạo.',
      teacher: 'Thầy Nguyễn Văn Nam',
      schedule: 'Chiều thứ 5 hàng tuần (16h00 - 17h30)',
      location: 'Phòng Lab 3',
      fee: 200000,
      status: 'open',
    },
  });

  // BusRouteInfo (UAT-HS-001 stable assigned bus route, no fake GPS)
  await prisma.busRouteInfo.upsert({
    where: {
      studentId_routeId: {
        studentId: student.id,
        routeId: 'route-01',
      },
    },
    update: {
      routeName: 'Tuyến Bus 01 - Thanh Xuân - Cầu Giấy',
      pickupPoint: '128 Nguyễn Trãi',
      dropoffPoint: 'Cổng Trường',
      pickupTime: '06:45',
      dropoffTime: '17:15',
      driverName: 'Bác Bùi Văn Thắng',
      driverPhone: '0987654321',
      busPlate: '29B-12345',
    },
    create: {
      studentId: student.id,
      routeId: 'route-01',
      routeName: 'Tuyến Bus 01 - Thanh Xuân - Cầu Giấy',
      pickupPoint: '128 Nguyễn Trãi',
      dropoffPoint: 'Cổng Trường',
      pickupTime: '06:45',
      dropoffTime: '17:15',
      driverName: 'Bác Bùi Văn Thắng',
      driverPhone: '0987654321',
      busPlate: '29B-12345',
    },
  });

  // UniformProduct
  await prisma.uniformProduct.upsert({
    where: { id: 'uniform-prod-1' },
    update: {
      name: 'Áo Sơ Mi Đồng Phục Nam/Nữ',
      category: 'Áo sơ mi',
      price: 180000,
      sizesJson: ['S', 'M', 'L', 'XL'],
      stock: 100,
    },
    create: {
      id: 'uniform-prod-1',
      name: 'Áo Sơ Mi Đồng Phục Nam/Nữ',
      category: 'Áo sơ mi',
      price: 180000,
      sizesJson: ['S', 'M', 'L', 'XL'],
      stock: 100,
    },
  });

  // TimetableSchedule
  await prisma.timetableSchedule.upsert({
    where: {
      studentId_weekStart: {
        studentId: student.id,
        weekStart: new Date('2026-07-20T00:00:00Z'),
      },
    },
    update: {
      daysJson: [
        {
          day_of_week: 1,
          period: 1,
          subject: 'Toán Học',
          teacher: 'Cô Mai',
          room: '201',
        },
        {
          day_of_week: 1,
          period: 2,
          subject: 'Ngữ Văn',
          teacher: 'Thầy Đức',
          room: '201',
        },
      ],
    },
    create: {
      studentId: student.id,
      weekStart: new Date('2026-07-20T00:00:00Z'),
      daysJson: [
        {
          day_of_week: 1,
          period: 1,
          subject: 'Toán Học',
          teacher: 'Cô Mai',
          room: '201',
        },
        {
          day_of_week: 1,
          period: 2,
          subject: 'Ngữ Văn',
          teacher: 'Thầy Đức',
          room: '201',
        },
      ],
    },
  });

  // HomeworkAssignment
  const homework = await prisma.homeworkAssignment.upsert({
    where: { id: 'uat-homework-math-1' },
    update: {
      studentId: student.id,
      targetType: 'students',
      studentIds: [student.id],
      title: 'Bài tập Đại số tuần 1',
      subject: 'Toán Học',
      content: 'Làm bài 1 đến 5 trang 24 sách bài tập.',
      teacher: 'Cô Mai',
      deadline: new Date('2026-09-20T23:59:59Z'),
      status: 'pending',
      archivedAt: null,
    },
    create: {
      id: 'uat-homework-math-1',
      studentId: student.id,
      targetType: 'students',
      studentIds: [student.id],
      title: 'Bài tập Đại số tuần 1',
      subject: 'Toán Học',
      content: 'Làm bài 1 đến 5 trang 24 sách bài tập.',
      teacher: 'Cô Mai',
      deadline: new Date('2026-09-20T23:59:59Z'),
      status: 'pending',
    },
  });
  await prisma.homeworkSubmission.upsert({
    where: {
      homeworkId_studentId: { homeworkId: homework.id, studentId: student.id },
    },
    update: { content: 'Bài làm UAT đã nộp.', status: 'submitted' },
    create: {
      homeworkId: homework.id,
      studentId: student.id,
      content: 'Bài làm UAT đã nộp.',
      status: 'submitted',
    },
  });

  // StudentScoreRecord
  await prisma.studentScoreRecord.upsert({
    where: {
      studentId_semesterId_subjectId: {
        studentId: student.id,
        semesterId: semester.id,
        subjectId: 'toan-hoc',
      },
    },
    update: {
      subjectName: 'Toán Học',
      fifteenMinScoresJson: [9.5, 9.0],
      midtermScore: 9.0,
      finalScore: 9.5,
      averageScore: 9.3,
      teacherComment: 'Bài làm rất tốt, tiếp tục phát huy.',
    },
    create: {
      studentId: student.id,
      semesterId: semester.id,
      subjectId: 'toan-hoc',
      subjectName: 'Toán Học',
      fifteenMinScoresJson: [9.5, 9.0],
      midtermScore: 9.0,
      finalScore: 9.5,
      averageScore: 9.3,
      teacherComment: 'Bài làm rất tốt, tiếp tục phát huy.',
    },
  });

  await prisma.studentScoreRecord.upsert({
    where: {
      studentId_semesterId_subjectId: {
        studentId: student.id,
        semesterId: semester.id,
        subjectId: 'ngu-van',
      },
    },
    update: {
      subjectName: 'Ngữ Văn',
      fifteenMinScoresJson: [8.5, 9.0],
      midtermScore: 8.5,
      finalScore: 9.0,
      averageScore: 8.7,
      teacherComment: 'Cảm thụ tác phẩm tốt, diễn đạt mượt mà.',
    },
    create: {
      studentId: student.id,
      semesterId: semester.id,
      subjectId: 'ngu-van',
      subjectName: 'Ngữ Văn',
      fifteenMinScoresJson: [8.5, 9.0],
      midtermScore: 8.5,
      finalScore: 9.0,
      averageScore: 8.7,
      teacherComment: 'Cảm thụ tác phẩm tốt, diễn đạt mượt mà.',
    },
  });

  // RewardDisciplineRecord
  await prisma.rewardDisciplineRecord.upsert({
    where: { id: 'reward-uat-hs-001-1' },
    update: {
      studentId: student.id,
      semesterId: semester.id,
      schoolYear: '2026-2027',
      type: 'reward',
      title: 'Khen thưởng Học sinh Giỏi Học kỳ 1',
      content:
        'Đạt thành tích xuất sắc trong học tập và rèn luyện môn Toán và Ngữ Văn.',
      date: new Date('2026-01-15T00:00:00Z'),
      issuer: 'Hiệu trưởng',
    },
    create: {
      id: 'reward-uat-hs-001-1',
      studentId: student.id,
      semesterId: semester.id,
      schoolYear: '2026-2027',
      type: 'reward',
      title: 'Khen thưởng Học sinh Giỏi Học kỳ 1',
      content:
        'Đạt thành tích xuất sắc trong học tập và rèn luyện môn Toán và Ngữ Văn.',
      date: new Date('2026-01-15T00:00:00Z'),
      issuer: 'Hiệu trưởng',
    },
  });

  // CoinFundTransaction
  await prisma.coinFundTransaction.upsert({
    where: { id: 'coin-tx-1' },
    update: {
      studentId: student.id,
      amount: 100,
      description: 'Thưởng học sinh giỏi môn Toán Học',
    },
    create: {
      id: 'coin-tx-1',
      studentId: student.id,
      amount: 100,
      description: 'Thưởng học sinh giỏi môn Toán Học',
    },
  });
}

void main();
