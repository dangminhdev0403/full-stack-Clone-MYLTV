import { Injectable, NotFoundException } from '@nestjs/common';
import { pagination } from '../common/api-response';
import {
  dateOnly,
  limitFrom,
  optionalString,
  pageFrom,
  skipFrom,
} from '../common/query';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async meals(query: Record<string, unknown>) {
    const studentId = optionalString(query.student_id);
    const rows = await this.prisma.mealRecord.findMany({
      where: { studentId },
      orderBy: { date: 'asc' },
    });
    return {
      registered: rows.some(
        (row) => row.status === 'registered' || row.status === 'served',
      ),
      items: rows.map((row) => ({
        date: dateOnly(row.date),
        breakfast: row.breakfast,
        lunch: row.lunch,
        snack: row.snack,
        status: row.status,
      })),
    };
  }

  async registerMeals(body: {
    student_id: string;
    dates: string[];
    action: 'register' | 'cancel';
  }) {
    await this.prisma.$transaction(
      body.dates.map((date) =>
        this.prisma.mealRecord.upsert({
          where: {
            studentId_date: {
              studentId: body.student_id,
              date: new Date(`${date}T00:00:00.000Z`),
            },
          },
          update: {
            status: body.action === 'register' ? 'registered' : 'cancelled',
          },
          create: {
            studentId: body.student_id,
            date: new Date(`${date}T00:00:00.000Z`),
            status: body.action === 'register' ? 'registered' : 'cancelled',
          },
        }),
      ),
    );
    return { updated: true };
  }

  async coinFund(query: Record<string, unknown>) {
    const studentId = optionalString(query.student_id);
    const transactions = await this.prisma.coinTransaction.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: limitFrom(query.limit),
      skip: skipFrom(pageFrom(query.page), limitFrom(query.limit)),
    });
    return {
      balance: transactions.reduce((sum, tx) => sum + tx.amount, 0),
      currency: 'coin',
      transactions: transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        created_at: tx.createdAt.toISOString(),
      })),
    };
  }

  async events(query: Record<string, unknown>) {
    const page = pageFrom(query.page);
    const limit = limitFrom(query.limit);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        orderBy: { startAt: 'asc' },
        skip: skipFrom(page, limit),
        take: limit,
      }),
      this.prisma.event.count(),
    ]);
    return {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        start_at: item.startAt.toISOString(),
        end_at: item.endAt.toISOString(),
        location: item.location,
        registration_deadline: item.registrationDeadline.toISOString(),
        status: item.status,
      })),
      pagination: pagination(page, limit, total),
    };
  }

  async registerEvent(
    eventId: string,
    body: { student_id: string; note?: string | null },
  ) {
    await this.prisma.eventRegistration.upsert({
      where: { eventId_studentId: { eventId, studentId: body.student_id } },
      update: { note: body.note },
      create: { eventId, studentId: body.student_id, note: body.note },
    });
    return { registered: true };
  }

  async surveys(query: Record<string, unknown>) {
    const page = pageFrom(query.page);
    const limit = limitFrom(query.limit);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.survey.findMany({
        include: { questions: true },
        orderBy: { deadline: 'asc' },
        skip: skipFrom(page, limit),
        take: limit,
      }),
      this.prisma.survey.count(),
    ]);
    const now = new Date();
    return {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        deadline: item.deadline.toISOString(),
        status: item.deadline < now ? 'expired' : 'pending',
        questions: item.questions.map((question) => ({
          id: question.id,
          type: question.type,
          content: question.content,
          options: question.options,
          required: question.required,
        })),
      })),
      pagination: pagination(page, limit, total),
    };
  }

  async submitSurvey(
    surveyId: string,
    body: { student_id: string; answers: unknown[] },
  ) {
    await this.prisma.surveySubmission.upsert({
      where: { surveyId_studentId: { surveyId, studentId: body.student_id } },
      update: { answers: body.answers as never },
      create: {
        surveyId,
        studentId: body.student_id,
        answers: body.answers as never,
      },
    });
    return { submitted: true };
  }

  async clubs(query: Record<string, unknown>) {
    const page = pageFrom(query.page);
    const limit = limitFrom(query.limit);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.club.findMany({
        orderBy: { name: 'asc' },
        skip: skipFrom(page, limit),
        take: limit,
      }),
      this.prisma.club.count(),
    ]);
    return {
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        teacher: item.teacher,
        schedule: item.schedule,
        location: item.location,
        fee: item.fee,
        status: item.status,
      })),
      pagination: pagination(page, limit, total),
    };
  }

  async registerClub(
    clubId: string,
    body: { student_id: string; note?: string | null },
  ) {
    await this.prisma.clubRegistration.upsert({
      where: { clubId_studentId: { clubId, studentId: body.student_id } },
      update: { note: body.note },
      create: { clubId, studentId: body.student_id, note: body.note },
    });
    return { registered: true };
  }

  async busTracking(query: Record<string, unknown>) {
    const routeId = optionalString(query.route_id);
    const assignment = optionalString(query.student_id)
      ? await this.prisma.busAssignment.findUnique({
          where: { studentId: optionalString(query.student_id) },
          include: { route: true },
        })
      : null;
    const route =
      assignment?.route ??
      (routeId
        ? await this.prisma.busRoute.findUnique({ where: { id: routeId } })
        : null);
    if (!route) {
      throw new NotFoundException('Bus route not found');
    }
    return {
      route_id: route.id,
      route_name: route.name,
      bus_plate: route.busPlate,
      driver_name: route.driverName,
      driver_phone: route.driverPhone,
      current_location: {
        lat: route.currentLat ?? 0,
        lng: route.currentLng ?? 0,
        updated_at: route.locationUpdatedAt?.toISOString() ?? null,
      },
      next_stop: route.nextStop,
      estimated_arrival_time: route.estimatedArrivalTime,
    };
  }

  async uniforms(query: Record<string, unknown>) {
    const page = pageFrom(query.page);
    const limit = limitFrom(query.limit);
    const keyword = optionalString(query.keyword);
    const category = optionalString(query.category);
    const where = {
      category,
      ...(keyword
        ? { name: { contains: keyword, mode: 'insensitive' as const } }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.uniformProduct.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: skipFrom(page, limit),
        take: limit,
      }),
      this.prisma.uniformProduct.count({ where }),
    ]);
    return {
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        currency: item.currency,
        sizes: item.sizes,
        image_url: item.imageUrl,
        stock: item.stock,
      })),
      pagination: pagination(page, limit, total),
    };
  }

  async orderUniforms(body: {
    student_id: string;
    items: { product_id: string; size: string; quantity: number }[];
    note?: string | null;
  }) {
    const products = await this.prisma.uniformProduct.findMany({
      where: { id: { in: body.items.map((item) => item.product_id) } },
    });
    const priceById = new Map(
      products.map((product) => [product.id, product.price]),
    );
    const totalAmount = body.items.reduce(
      (sum, item) =>
        sum + (priceById.get(item.product_id) ?? 0) * item.quantity,
      0,
    );
    const order = await this.prisma.uniformOrder.create({
      data: {
        studentId: body.student_id,
        totalAmount,
        note: body.note,
        items: {
          create: body.items.map((item) => ({
            productId: item.product_id,
            size: item.size,
            quantity: item.quantity,
            unitPrice: priceById.get(item.product_id) ?? 0,
          })),
        },
      },
    });
    return {
      order_id: order.id,
      total_amount: order.totalAmount,
      status: order.status,
    };
  }

  async tuition(query: Record<string, unknown>) {
    const rows = await this.prisma.tuitionItem.findMany({
      where: {
        studentId: optionalString(query.student_id),
        schoolYear: optionalString(query.school_year),
        semester: optionalString(query.semester),
      },
      orderBy: { dueDate: 'asc' },
    });
    const total = rows.reduce((sum, item) => sum + item.amount, 0);
    const paid = rows.reduce((sum, item) => sum + item.paidAmount, 0);
    return {
      items: rows.map((item) => ({
        id: item.id,
        title: item.title,
        amount: item.amount,
        paid_amount: item.paidAmount,
        remaining_amount: Math.max(item.amount - item.paidAmount, 0),
        due_date: dateOnly(item.dueDate),
        status: item.status,
      })),
      summary: {
        total_amount: total,
        paid_amount: paid,
        remaining_amount: Math.max(total - paid, 0),
        currency: 'VND',
      },
    };
  }

  async paymentRequest(body: {
    student_id: string;
    tuition_ids: string[];
    payment_method: string;
  }) {
    const items = await this.prisma.tuitionItem.findMany({
      where: { id: { in: body.tuition_ids }, studentId: body.student_id },
    });
    const amount = items.reduce(
      (sum, item) => sum + Math.max(item.amount - item.paidAmount, 0),
      0,
    );
    const payment = await this.prisma.paymentRequest.create({
      data: {
        studentId: body.student_id,
        tuitionIds: body.tuition_ids,
        amount,
        paymentMethod: body.payment_method,
      },
    });
    return {
      payment_id: payment.id,
      amount: payment.amount,
      payment_url: payment.paymentUrl,
      qr_code_url: payment.qrCodeUrl,
      status: payment.status,
    };
  }
}
