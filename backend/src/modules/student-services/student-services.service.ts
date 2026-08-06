import { Injectable } from '@nestjs/common';
import { ok } from '../../common/http/api-response';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterMealsDto {
  student_id: string;
  dates: string[];
  action: 'register' | 'cancel';
}

export interface OrderUniformsDto {
  student_id: string;
  items: Array<{ price?: number; quantity?: number }>;
  note?: string;
}

export interface SubmitFeedbackDto {
  student_id?: string;
  title: string;
  content: string;
  category?: string;
  attachments?: string[];
}

@Injectable()
export class StudentServicesService {
  constructor(private readonly prisma: PrismaService) {}

  // Meals
  async getMeals(studentId?: string, fromDate?: string, toDate?: string) {
    const records = await this.prisma.mealRegistration.findMany({
      where: {
        studentId: studentId ?? 'default-student',
        ...(fromDate && toDate
          ? { date: { gte: new Date(fromDate), lte: new Date(toDate) } }
          : {}),
      },
      orderBy: { date: 'asc' },
    });
    return ok({
      package: {
        id: 'meal_pkg_1',
        name: 'Gói bán trú tháng 07',
        remaining_meals: 12,
        paid_amount: 850000,
        expires_at: '2026-07-31',
        status: 'active',
      },
      menus: records.map((r) => ({
        date: r.date.toISOString().split('T')[0],
        day_label:
          'Thứ ' + (r.date.getDay() === 0 ? 'Chủ nhật' : r.date.getDay() + 1),
        main_dish: r.lunch || 'Cơm trưa bán trú',
        soup: 'Canh rau cải',
        side_dish: null,
        dessert: r.snack || 'Trái cây',
        registration_status: r.status,
      })),
    });
  }

  async registerMeals(body: RegisterMealsDto) {
    for (const d of body.dates) {
      const date = new Date(d);
      if (body.action === 'register') {
        await this.prisma.mealRegistration.upsert({
          where: { studentId_date: { studentId: body.student_id, date } },
          create: {
            studentId: body.student_id,
            date,
            status: 'registered',
            lunch: 'Cơm trưa bán trú',
          },
          update: { status: 'registered' },
        });
      } else {
        await this.prisma.mealRegistration.updateMany({
          where: { studentId: body.student_id, date },
          data: { status: 'cancelled' },
        });
      }
    }
    return ok({ updated: true });
  }

  // Coin Fund
  async getCoinFund(studentId?: string) {
    const targetStudentId = studentId ?? 'default-student';
    const transactions = await this.prisma.coinFundTransaction.findMany({
      where: { studentId: targetStudentId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const balance = transactions.reduce((acc, t) => acc + t.amount, 0);
    return ok({
      student_id: targetStudentId,
      balance,
      total_deposit: balance > 0 ? balance : 0,
      total_spent: 0,
      unit: 'coin',
      transactions: transactions.map((t) => ({
        id: t.id,
        title: t.description,
        type: t.type === 'deposit' ? 'credit' : 'debit',
        amount: t.amount,
        status: 'approved',
        occurred_at: t.createdAt.toISOString(),
      })),
    });
  }

  // Events
  async getEvents(_studentId?: string) {
    const items = await this.prisma.schoolEvent.findMany({
      orderBy: { startAt: 'desc' },
    });
    return ok({
      items: items.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        starts_at: e.startAt.toISOString(),
        ends_at: e.endAt.toISOString(),
        location: e.location,
        registration_deadline: e.registrationDeadline
          ? e.registrationDeadline.toISOString()
          : null,
        capacity: 300,
        registered_count: 120,
        registration_status: e.status,
        student_registration_status: 'not_registered',
      })),
      pagination: { page: 1, limit: 20, total: items.length },
    });
  }

  async registerEvent(
    eventId: string,
    body: { student_id: string; note?: string },
  ) {
    await this.prisma.eventRegistration.upsert({
      where: { eventId_studentId: { eventId, studentId: body.student_id } },
      create: { eventId, studentId: body.student_id, note: body.note },
      update: { note: body.note },
    });
    return ok({ registered: true });
  }

  // Surveys
  async getSurveys(_studentId?: string) {
    const items = await this.prisma.surveyForm.findMany({
      include: { questions: true },
      orderBy: { createdAt: 'desc' },
    });
    return ok({
      items: items.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        question_count: s.questions.length,
        deadline: s.deadline.toISOString(),
        status: s.status,
        submission_status: 'not_submitted',
      })),
      pagination: { page: 1, limit: 20, total: items.length },
    });
  }

  async submitSurvey(
    surveyId: string,
    body: { student_id: string; answers: unknown[] },
  ) {
    await this.prisma.surveySubmission.upsert({
      where: { surveyId_studentId: { surveyId, studentId: body.student_id } },
      create: {
        surveyId,
        studentId: body.student_id,
        answersJson: body.answers as any,
      },
      update: { answersJson: body.answers as any },
    });
    return ok({ submitted: true });
  }

  // Clubs
  async getClubs(_studentId?: string) {
    const items = await this.prisma.schoolClub.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return ok({
      items: items.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        schedule_text: c.schedule,
        location: c.location,
        teacher_name: c.teacher,
        capacity: 30,
        remaining_slots: 8,
        registration_status: c.status,
        student_registration_status: 'not_registered',
      })),
      pagination: { page: 1, limit: 20, total: items.length },
    });
  }

  async registerClub(
    clubId: string,
    body: { student_id: string; note?: string },
  ) {
    await this.prisma.clubRegistration.upsert({
      where: { clubId_studentId: { clubId, studentId: body.student_id } },
      create: { clubId, studentId: body.student_id, note: body.note },
      update: { note: body.note },
    });
    return ok({ registered: true });
  }

  // Bus Route & Tracking
  async getBusRoute(studentId: string) {
    const info = await this.prisma.busRouteInfo.findFirst({
      where: { studentId },
    });
    return ok({
      route_id: info?.routeId || 'route_03',
      route_name: info?.routeName || 'Xe tuyến 03',
      vehicle_plate: info?.busPlate || '29B-123.45',
      driver_name: info?.driverName || 'Nguyễn Văn Hùng',
      driver_phone: info?.driverPhone || '0901234567',
      student_stop_id: 'stop_2',
      stops: [
        {
          id: 'stop_1',
          name: 'Nhà văn hóa phường',
          sequence: 1,
          pickup_time: '06:25',
        },
      ],
    });
  }

  async getBusTracking(studentId?: string, routeId?: string) {
    let whereClause = {};
    if (routeId) {
      whereClause = { routeId };
    } else if (studentId) {
      whereClause = { studentId };
    }

    const info = await this.prisma.busRouteInfo.findFirst({
      where: whereClause,
    });
    return ok({
      route_id: info?.routeId || 'route_03',
      route_name: info?.routeName || 'Xe tuyến 03',
      vehicle_plate: info?.busPlate || '29B-123.45',
      driver: {
        name: info?.driverName || 'Nguyễn Văn Hùng',
        phone: info?.driverPhone || '0901234567',
      },
      tracking: {
        latitude: info?.currentLat || 21.028511,
        longitude: info?.currentLng || 105.804817,
        speed_kph: 32,
        heading: 90,
        location_text: 'Cách điểm đón tiếp theo 1.2 km',
        recorded_at: new Date().toISOString(),
        status: 'online',
      },
      stops: [
        {
          id: 'stop_1',
          name: 'Cổng khu đô thị A',
          sequence: 1,
          estimated_at: '06:35',
          status: 'approaching',
          latitude: 21.02,
          longitude: 105.8,
        },
      ],
    });
  }

  // Uniforms
  async getUniforms() {
    const items = await this.prisma.uniformProduct.findMany();
    return ok({
      products: items.map((u) => ({
        id: u.id,
        name: u.name,
        image_url: u.imageUrl,
        variants: [
          {
            sku: `${u.id}-M`,
            size: 'M',
            price: u.price,
            stock_status: 'in_stock',
          },
        ],
      })),
      latest_order: null,
    });
  }

  async orderUniforms(body: OrderUniformsDto) {
    const totalAmount = body.items.reduce(
      (sum, item) => sum + (item.price || 150000) * (item.quantity || 1),
      0,
    );
    const order = await this.prisma.uniformOrder.create({
      data: {
        studentId: body.student_id,
        itemsJson: body.items as any,
        totalAmount,
        note: body.note,
        status: 'pending',
      },
    });
    return ok({
      order_id: order.id,
      total_amount: order.totalAmount,
      status: order.status,
    });
  }

  // Uploads
  async saveUpload(fileInfo: {
    fileName: string;
    mimeType: string;
    size: number;
    folder?: string;
  }) {
    const file = await this.prisma.attachmentFile.create({
      data: {
        fileName: fileInfo.fileName,
        fileUrl: `/uploads/${fileInfo.folder || 'attachment'}/${fileInfo.fileName}`,
        mimeType: fileInfo.mimeType,
        size: fileInfo.size,
        folder: fileInfo.folder || 'attachment',
      },
    });
    return ok({
      file_id: file.id,
      file_name: file.fileName,
      file_url: file.fileUrl,
      mime_type: file.mimeType,
      size: file.size,
    });
  }

  // Feedback
  async submitFeedback(body: SubmitFeedbackDto, actorId?: string) {
    const item = await this.prisma.feedbackItem.create({
      data: {
        studentId: body.student_id,
        accountId: actorId,
        title: body.title,
        content: body.content,
        category: body.category || 'khac',
        attachmentsJson: body.attachments as any,
        status: 'new',
      },
    });
    return ok({
      id: item.id,
      status: item.status,
      created_at: item.createdAt.toISOString(),
    });
  }

  async listAdminEvents(page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.prisma.schoolEvent.findMany({
        skip,
        take: pageSize,
        orderBy: { startAt: 'desc' },
        include: { _count: { select: { registrations: true } } },
      }),
      this.prisma.schoolEvent.count(),
    ]);

    return ok({
      items: items.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        start_at: e.startAt.toISOString(),
        end_at: e.endAt.toISOString(),
        location: e.location,
        registration_deadline: e.registrationDeadline?.toISOString() || null,
        status: e.status,
        registration_count: e._count.registrations,
        created_at: e.createdAt.toISOString(),
      })),
      page,
      page_size: pageSize,
      total,
      has_next: skip + items.length < total,
    });
  }

  async createAdminEvent(body: {
    title: string;
    description: string;
    start_at: string;
    end_at: string;
    location?: string;
    registration_deadline?: string;
    status?: string;
  }) {
    const event = await this.prisma.schoolEvent.create({
      data: {
        title: body.title,
        description: body.description,
        startAt: new Date(body.start_at),
        endAt: new Date(body.end_at),
        location: body.location,
        registrationDeadline: body.registration_deadline
          ? new Date(body.registration_deadline)
          : null,
        status: body.status || 'open',
      },
    });

    return ok({
      id: event.id,
      title: event.title,
      description: event.description,
      start_at: event.startAt.toISOString(),
      end_at: event.endAt.toISOString(),
      location: event.location,
      registration_deadline: event.registrationDeadline?.toISOString() || null,
      status: event.status,
      created_at: event.createdAt.toISOString(),
    });
  }

  async getAdminEventDetail(id: string) {
    const event = await this.prisma.schoolEvent.findUnique({
      where: { id },
      include: {
        registrations: true,
      },
    });
    if (!event) throw new Error('Event not found');

    return ok({
      id: event.id,
      title: event.title,
      description: event.description,
      start_at: event.startAt.toISOString(),
      end_at: event.endAt.toISOString(),
      location: event.location,
      registration_deadline: event.registrationDeadline?.toISOString() || null,
      status: event.status,
      registrations: event.registrations.map((r) => ({
        id: r.id,
        student_id: r.studentId,
        note: r.note,
        registered_at: r.registeredAt.toISOString(),
      })),
      created_at: event.createdAt.toISOString(),
    });
  }

  async updateAdminEvent(
    id: string,
    body: {
      title?: string;
      description?: string;
      start_at?: string;
      end_at?: string;
      location?: string;
      registration_deadline?: string;
      status?: string;
    },
  ) {
    const updated = await this.prisma.schoolEvent.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description && { description: body.description }),
        ...(body.start_at && { startAt: new Date(body.start_at) }),
        ...(body.end_at && { endAt: new Date(body.end_at) }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.registration_deadline !== undefined && {
          registrationDeadline: body.registration_deadline
            ? new Date(body.registration_deadline)
            : null,
        }),
        ...(body.status && { status: body.status }),
      },
    });

    return ok({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      start_at: updated.startAt.toISOString(),
      end_at: updated.endAt.toISOString(),
      location: updated.location,
      registration_deadline:
        updated.registrationDeadline?.toISOString() || null,
      status: updated.status,
    });
  }

  async deleteAdminEvent(id: string) {
    await this.prisma.schoolEvent.delete({ where: { id } });
    return ok({ deleted: true });
  }
}
