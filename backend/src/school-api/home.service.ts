import { Injectable } from '@nestjs/common';
import { pagination } from '../common/api-response';
import { limitFrom, optionalString, pageFrom, skipFrom } from '../common/query';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomeService {
  constructor(private readonly prisma: PrismaService) {}

  async news(query: Record<string, unknown>) {
    const page = pageFrom(query.page);
    const limit = limitFrom(query.limit);
    const keyword = optionalString(query.keyword);
    const where = keyword
      ? {
          OR: [
            { title: { contains: keyword, mode: 'insensitive' as const } },
            { summary: { contains: keyword, mode: 'insensitive' as const } },
            { content: { contains: keyword, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.newsArticle.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        skip: skipFrom(page, limit),
        take: limit,
      }),
      this.prisma.newsArticle.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        content: item.content,
        image_url: item.imageUrl,
        published_at: item.publishedAt.toISOString(),
        category: item.category.split('_').join(' '),
        is_pinned: item.isPinned,
      })),
      pagination: pagination(page, limit, total),
    };
  }

  async attendanceToday(query: Record<string, unknown>) {
    const studentId = optionalString(query.student_id);
    const requestedDate = optionalString(query.date);
    const day = requestedDate
      ? new Date(`${requestedDate}T00:00:00.000Z`)
      : new Date();
    day.setUTCHours(0, 0, 0, 0);

    const record = await this.prisma.attendanceRecord.findFirst({
      where: { studentId, date: day },
      orderBy: { date: 'desc' },
    });

    return {
      date: day.toISOString().slice(0, 10),
      arrived_at: record?.arrivedAt ?? null,
      left_at: record?.leftAt ?? null,
      status: record?.status ?? 'unknown',
      note: record?.note ?? null,
    };
  }

  async tuitionSummary(query: Record<string, unknown>) {
    const studentId = optionalString(query.student_id);
    const schoolYear = optionalString(query.school_year);
    const semester = optionalString(query.semester);
    const items = await this.prisma.tuitionItem.findMany({
      where: { studentId, schoolYear, semester },
    });
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    const paid = items.reduce((sum, item) => sum + item.paidAmount, 0);
    const remaining = Math.max(total - paid, 0);

    return {
      total_amount: total,
      paid_amount: paid,
      remaining_amount: remaining,
      currency: 'VND',
      status: remaining === 0 ? 'paid' : paid === 0 ? 'unpaid' : 'partial',
    };
  }
}
