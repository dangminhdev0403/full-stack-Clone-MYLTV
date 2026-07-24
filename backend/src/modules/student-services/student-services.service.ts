import { Injectable } from '@nestjs/common';
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
        ...(fromDate && toDate ? { date: { gte: new Date(fromDate), lte: new Date(toDate) } } : {}),
      },
      orderBy: { date: 'asc' },
    });
    return {
      registered: records.length > 0,
      items: records.map((r) => ({
        date: r.date.toISOString().split('T')[0],
        breakfast: r.breakfast,
        lunch: r.lunch,
        snack: r.snack,
        status: r.status,
      })),
    };
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
    return { updated: true };
  }

  // Coin Fund
  async getCoinFund(studentId?: string) {
    const transactions = await this.prisma.coinFundTransaction.findMany({
      where: { studentId: studentId ?? 'default-student' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const balance = transactions.reduce((acc, t) => acc + t.amount, 0);
    return {
      balance,
      currency: 'coin',
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        created_at: t.createdAt.toISOString(),
      })),
    };
  }

  // Events
  async getEvents(studentId?: string) {
    const items = await this.prisma.schoolEvent.findMany({
      orderBy: { startAt: 'desc' },
    });
    return {
      items: items.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        start_at: e.startAt.toISOString(),
        end_at: e.endAt.toISOString(),
        location: e.location,
        registration_deadline: e.registrationDeadline ? e.registrationDeadline.toISOString() : null,
        status: e.status,
      })),
      pagination: { page: 1, limit: 20, total: items.length },
    };
  }

  async registerEvent(eventId: string, body: { student_id: string; note?: string }) {
    await this.prisma.eventRegistration.upsert({
      where: { eventId_studentId: { eventId, studentId: body.student_id } },
      create: { eventId, studentId: body.student_id, note: body.note },
      update: { note: body.note },
    });
    return { registered: true };
  }

  // Surveys
  async getSurveys(studentId?: string) {
    const items = await this.prisma.surveyForm.findMany({
      include: { questions: true },
      orderBy: { createdAt: 'desc' },
    });
    return {
      items: items.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        deadline: s.deadline.toISOString(),
        status: s.status,
        questions: s.questions.map((q) => ({
          id: q.id,
          type: q.type,
          content: q.content,
          options: (q.optionsJson as string[]) || [],
          required: q.required,
        })),
      })),
      pagination: { page: 1, limit: 20, total: items.length },
    };
  }

  async submitSurvey(surveyId: string, body: { student_id: string; answers: unknown[] }) {
    await this.prisma.surveySubmission.upsert({
      where: { surveyId_studentId: { surveyId, studentId: body.student_id } },
      create: {
        surveyId,
        studentId: body.student_id,
        answersJson: body.answers as any,
      },
      update: { answersJson: body.answers as any },
    });
    return { submitted: true };
  }

  // Clubs
  async getClubs(studentId?: string) {
    const items = await this.prisma.schoolClub.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return {
      items: items.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        teacher: c.teacher,
        schedule: c.schedule,
        location: c.location,
        fee: c.fee,
        status: c.status,
      })),
      pagination: { page: 1, limit: 20, total: items.length },
    };
  }

  async registerClub(clubId: string, body: { student_id: string; note?: string }) {
    await this.prisma.clubRegistration.upsert({
      where: { clubId_studentId: { clubId, studentId: body.student_id } },
      create: { clubId, studentId: body.student_id, note: body.note },
      update: { note: body.note },
    });
    return { registered: true };
  }

  // Bus Route & Tracking
  async getBusRoute(studentId: string) {
    const info = await this.prisma.busRouteInfo.findFirst({
      where: { studentId },
    });
    if (!info) {
      return {
        route_id: null,
        route_name: null,
        pickup_point: null,
        dropoff_point: null,
        pickup_time: null,
        dropoff_time: null,
        driver_name: null,
        driver_phone: null,
        bus_plate: null,
      };
    }
    return {
      route_id: info.routeId,
      route_name: info.routeName,
      pickup_point: info.pickupPoint,
      dropoff_point: info.dropoffPoint,
      pickup_time: info.pickupTime,
      dropoff_time: info.dropoffTime,
      driver_name: info.driverName,
      driver_phone: info.driverPhone,
      bus_plate: info.busPlate,
    };
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
    return {
      route_id: info?.routeId || 'T-01',
      route_name: info?.routeName || 'Tuyen 01 - Luong The Vinh - Ha Dong',
      bus_plate: info?.busPlate || '29B-12345',
      driver_name: info?.driverName || 'Nguyen Van Tai',
      driver_phone: info?.driverPhone || '0987654321',
      current_location: {
        lat: info?.currentLat || 21.0024,
        lng: info?.currentLng || 105.7915,
        updated_at: new Date().toISOString(),
      },
      next_stop: info?.nextStop || 'Tram Phung Hung',
      estimated_arrival_time: info?.estimatedTime || '07:15',
    };
  }

  // Uniforms
  async getUniforms() {
    const items = await this.prisma.uniformProduct.findMany();
    return {
      items: items.map((u) => ({
        id: u.id,
        name: u.name,
        category: u.category,
        price: u.price,
        currency: 'VND',
        sizes: (u.sizesJson as string[]) || ['S', 'M', 'L'],
        image_url: u.imageUrl,
        stock: u.stock,
      })),
      pagination: { page: 1, limit: 20, total: items.length },
    };
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
    return {
      order_id: order.id,
      total_amount: order.totalAmount,
      status: order.status,
    };
  }

  // Uploads
  async saveUpload(fileInfo: { fileName: string; mimeType: string; size: number; folder?: string }) {
    const file = await this.prisma.attachmentFile.create({
      data: {
        fileName: fileInfo.fileName,
        fileUrl: `/uploads/${fileInfo.folder || 'attachment'}/${fileInfo.fileName}`,
        mimeType: fileInfo.mimeType,
        size: fileInfo.size,
        folder: fileInfo.folder || 'attachment',
      },
    });
    return {
      file_id: file.id,
      file_name: file.fileName,
      file_url: file.fileUrl,
      mime_type: file.mimeType,
      size: file.size,
    };
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
    return {
      id: item.id,
      status: item.status,
      created_at: item.createdAt.toISOString(),
    };
  }

  async listAdminFeedback() {
    const items = await this.prisma.feedbackItem.findMany({ orderBy: { createdAt: 'desc' } });
    return items.map((f) => ({
      id: f.id,
      student_id: f.studentId,
      account_id: f.accountId,
      title: f.title,
      content: f.content,
      category: f.category,
      status: f.status,
      created_at: f.createdAt.toISOString(),
    }));
  }
}
