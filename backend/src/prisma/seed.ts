import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
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
    await seedAcademicContext(prisma);
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
        note: index === 0 ? 'Đến muộn 5 phút' : null,
        markedById: actor.id,
      })),
    });
  });
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

  // News
  await prisma.newsItem.upsert({
    where: { id: 'news-sample-1' },
    update: {
      title: 'Lễ Khai Giảng Năm Học Mới 2026-2027',
      summary:
        'Sổ Liên Lạc Điện Tử trang trọng tổ chức lễ khai giảng năm học mới.',
      content:
        'Nhà trường trân trọng kính mời quý phụ huynh và toàn thể học sinh tham dự lễ khai giảng năm học 2026-2027 vào lúc 7h30 sáng ngày 05/09/2026.',
      category: 'Sự kiện',
      status: 'published',
      isPinned: true,
      publishedAt: new Date('2026-07-20T08:00:00Z'),
      createdById: admin.id,
    },
    create: {
      id: 'news-sample-1',
      title: 'Lễ Khai Giảng Năm Học Mới 2026-2027',
      summary:
        'Sổ Liên Lạc Điện Tử trang trọng tổ chức lễ khai giảng năm học mới.',
      content:
        'Nhà trường trân trọng kính mời quý phụ huynh và toàn thể học sinh tham dự lễ khai giảng năm học 2026-2027 vào lúc 7h30 sáng ngày 05/09/2026.',
      category: 'Sự kiện',
      status: 'published',
      isPinned: true,
      publishedAt: new Date('2026-07-20T08:00:00Z'),
      createdById: admin.id,
    },
  });

  await prisma.newsItem.upsert({
    where: { id: 'news-sample-2' },
    update: {
      title: 'Thông Báo Lịch Học Kỳ 1 & Thời Khóa Biểu',
      summary: 'Lịch học chính thức và thời khóa biểu áp dụng từ tuần tới.',
      content:
        'Chi tiết thời khóa biểu các lớp khối 6 đến khối 12 đã được cập nhật trên ứng dụng Sổ Liên Lạc Điện Tử.',
      category: 'Thông báo',
      status: 'published',
      isPinned: false,
      publishedAt: new Date('2026-07-22T09:30:00Z'),
      createdById: admin.id,
    },
    create: {
      id: 'news-sample-2',
      title: 'Thông Báo Lịch Học Kỳ 1 & Thời Khóa Biểu',
      summary: 'Lịch học chính thức và thời khóa biểu áp dụng từ tuần tới.',
      content:
        'Chi tiết thời khóa biểu các lớp khối 6 đến khối 12 đã được cập nhật trên ứng dụng Sổ Liên Lạc Điện Tử.',
      category: 'Thông báo',
      status: 'published',
      isPinned: false,
      publishedAt: new Date('2026-07-22T09:30:00Z'),
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
      status: 'received',
    },
    create: {
      id: 'feedback-sample-1',
      title: 'Góp ý chất lượng thực đơn bán trú',
      content:
        'Mong nhà trường bổ sung thêm trái cây và rau xanh trong bữa trưa.',
      category: 'Bán trú',
      status: 'received',
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

  // BusRouteInfo
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
      currentLat: 21.0025,
      currentLng: 105.8152,
      nextStop: 'Ngã Tư Sở',
      estimatedTime: '10 phút',
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
      currentLat: 21.0025,
      currentLng: 105.8152,
      nextStop: 'Ngã Tư Sở',
      estimatedTime: '10 phút',
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
          day: 'Thứ 2',
          lessons: [
            { period: 1, subject: 'Toán Học', teacher: 'Cô Mai', room: '201' },
            { period: 2, subject: 'Ngữ Văn', teacher: 'Thầy Đức', room: '201' },
          ],
        },
      ],
    },
    create: {
      studentId: student.id,
      weekStart: new Date('2026-07-20T00:00:00Z'),
      daysJson: [
        {
          day: 'Thứ 2',
          lessons: [
            { period: 1, subject: 'Toán Học', teacher: 'Cô Mai', room: '201' },
            { period: 2, subject: 'Ngữ Văn', teacher: 'Thầy Đức', room: '201' },
          ],
        },
      ],
    },
  });

  // HomeworkAssignment
  await prisma.homeworkAssignment.upsert({
    where: { id: 'hw-sample-1' },
    update: {
      studentId: student.id,
      title: 'Bài tập Đại số Tuần 1',
      subject: 'Toán Học',
      content: 'Làm bài 1 đến 5 trang 24 sách bài tập.',
      teacher: 'Cô Mai',
      deadline: new Date('2026-09-20T23:59:59Z'),
      status: 'pending',
    },
    create: {
      id: 'hw-sample-1',
      studentId: student.id,
      title: 'Bài tập Đại số Tuần 1',
      subject: 'Toán Học',
      content: 'Làm bài 1 đến 5 trang 24 sách bài tập.',
      teacher: 'Cô Mai',
      deadline: new Date('2026-09-20T23:59:59Z'),
      status: 'pending',
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
