import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listNotifications(query: { student_id?: string; page?: number; limit?: number; keyword?: string; tag?: string; is_read?: boolean }, actorId?: string) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 20, 1);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.tag) where.tag = query.tag;
    if (query.keyword) {
      where.OR = [
        { title: { contains: query.keyword, mode: 'insensitive' } },
        { content: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit,
        include: { reads: { where: { OR: [{ accountId: actorId ?? '' }, { studentId: query.student_id ?? '' }] } } },
      }),
      this.prisma.notification.count({ where }),
    ]);

    const formatted = items.map((item) => ({
      id: item.id,
      title: item.title,
      sender: item.sender,
      sent_at: item.sentAt.toISOString(),
      content: item.content,
      tag: item.tag,
      is_read: item.reads.length > 0,
    }));

    return {
      items: formatted,
      pagination: { page, limit, total },
    };
  }

  async getNotificationDetail(id: string, actorId?: string) {
    const item = await this.prisma.notification.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Khong tim thay thong bao');

    let isRead = false;
    if (actorId) {
      const read = await this.prisma.notificationRead.findFirst({
        where: { notificationId: id, accountId: actorId },
      });
      isRead = Boolean(read);
    }

    return {
      id: item.id,
      title: item.title,
      sender: item.sender,
      sent_at: item.sentAt.toISOString(),
      content: item.content,
      attachments: [],
      is_read: isRead,
    };
  }

  async markAsRead(id: string, actorId?: string, studentId?: string) {
    const item = await this.prisma.notification.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Khong tim thay thong bao');

    const accId = actorId ?? 'anonymous';
    const stdId = studentId ?? 'none';

    await this.prisma.notificationRead.upsert({
      where: {
        notificationId_studentId_accountId: {
          notificationId: id,
          studentId: stdId,
          accountId: accId,
        },
      },
      create: {
        notificationId: id,
        studentId: stdId,
        accountId: accId,
      },
      update: {},
    });

    return { is_read: true };
  }

  async createNotification(data: { title: string; sender: string; content: string; tag?: string }, actorId?: string) {
    const item = await this.prisma.notification.create({
      data: {
        title: data.title,
        sender: data.sender || 'Ban giam hieu',
        content: data.content,
        tag: data.tag || 'Quan trong',
        createdById: actorId,
      },
    });
    return {
      id: item.id,
      title: item.title,
      sender: item.sender,
      sent_at: item.sentAt.toISOString(),
      content: item.content,
      tag: item.tag,
      is_read: false,
    };
  }
}
