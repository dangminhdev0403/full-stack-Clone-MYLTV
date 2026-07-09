import { Injectable, NotFoundException } from '@nestjs/common';
import { pagination } from '../common/api-response';
import {
  boolFrom,
  limitFrom,
  optionalString,
  pageFrom,
  skipFrom,
} from '../common/query';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: Record<string, unknown>) {
    const page = pageFrom(query.page);
    const limit = limitFrom(query.limit);
    const studentId = optionalString(query.student_id);
    const keyword = optionalString(query.keyword);
    const tag = optionalString(query.tag);
    const isRead = boolFrom(query.is_read);
    const where = {
      ...(keyword
        ? {
            OR: [
              { title: { contains: keyword, mode: 'insensitive' as const } },
              { content: { contains: keyword, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(tag ? { tag } : {}),
      ...(studentId || isRead !== undefined
        ? { reads: { some: { studentId, isRead } } }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        include: { reads: studentId ? { where: { studentId } } : true },
        orderBy: { sentAt: 'desc' },
        skip: skipFrom(page, limit),
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        sender: item.sender,
        sent_at: item.sentAt.toISOString(),
        content: item.content,
        tag: item.tag,
        is_read: item.reads?.[0]?.isRead ?? false,
      })),
      pagination: pagination(page, limit, total),
    };
  }

  async detail(notificationId: string, studentId?: string) {
    const item = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      include: { reads: studentId ? { where: { studentId } } : true },
    });

    if (!item) {
      throw new NotFoundException('Notification not found');
    }

    return {
      id: item.id,
      title: item.title,
      sender: item.sender,
      sent_at: item.sentAt.toISOString(),
      content: item.content,
      attachments: item.attachments ?? [],
      is_read: item.reads?.[0]?.isRead ?? false,
    };
  }

  async markRead(notificationId: string, studentId?: string) {
    if (!studentId) {
      const exists = await this.prisma.notification.findUnique({
        where: { id: notificationId },
      });
      if (!exists) {
        throw new NotFoundException('Notification not found');
      }
      return { is_read: true };
    }

    await this.prisma.notificationRead.upsert({
      where: { notificationId_studentId: { notificationId, studentId } },
      update: { isRead: true, readAt: new Date() },
      create: { notificationId, studentId, isRead: true, readAt: new Date() },
    });

    return { is_read: true };
  }
}
