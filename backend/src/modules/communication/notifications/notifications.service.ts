import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import { ok } from '../../../common/http/api-response';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../identity-access/audit/audit.service';
import type {
  NotificationListQueryDto,
  NotificationWriteRequestDto,
} from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listAdminNotifications(query: NotificationListQueryDto) {
    const page = this.page(query.page);
    const pageSize = this.pageSize(query.page_size);
    const where = this.where(query.q, query.tag);
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.notification.count({ where }),
    ]);
    return ok({
      items: items.map((item) => this.toDto(item)),
      page,
      page_size: pageSize,
      total,
      has_next: page * pageSize < total,
    });
  }

  async getAdminNotification(id: string) {
    return ok(this.toDto(await this.find(id)));
  }

  async createNotification(
    payload: NotificationWriteRequestDto,
    actor?: AuthenticatedUser,
  ) {
    const admin = this.requireAdmin(actor);
    const item = await this.prisma.$transaction(async (tx) => {
      const created = await tx.notification.create({
        data: {
          title: this.required(payload.title),
          sender: this.required(payload.sender),
          content: this.required(payload.content),
          tag: payload.tag ?? 'Quan trong',
          createdById: admin.id,
        },
      });
      await this.auditMutation(admin.id, 'create', created.id, tx);
      return created;
    });
    return ok(this.toDto(item));
  }

  async updateAdminNotification(
    id: string,
    payload: NotificationWriteRequestDto,
    actor?: AuthenticatedUser,
  ) {
    const admin = this.requireAdmin(actor);
    const item = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.notification.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Khong tim thay thong bao');
      const updated = await tx.notification.update({
        where: { id },
        data: {
          ...(payload.title !== undefined ? { title: payload.title } : {}),
          ...(payload.sender !== undefined ? { sender: payload.sender } : {}),
          ...(payload.content !== undefined
            ? { content: payload.content }
            : {}),
          ...(payload.tag !== undefined ? { tag: payload.tag } : {}),
        },
      });
      await this.auditMutation(admin.id, 'update', updated.id, tx);
      return updated;
    });
    return ok(this.toDto(item));
  }

  async listNotifications(
    query: NotificationListQueryDto,
    actor?: AuthenticatedUser,
  ) {
    const scope = this.requireAppScope(actor);
    const page = this.page(query.page);
    const pageSize = this.pageSize(query.page_size ?? query.limit);
    const where = this.where(query.q ?? query.keyword, query.tag);
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          reads: {
            where: {
              accountId: scope.accountId,
              studentId: scope.studentId,
            },
          },
        },
      }),
      this.prisma.notification.count({ where }),
    ]);
    return ok({
      items: items.map((item) => ({
        ...this.toDto(item),
        is_read: item.reads.length > 0,
      })),
      page,
      page_size: pageSize,
      total,
      has_next: page * pageSize < total,
    });
  }

  async getNotificationDetail(id: string, actor?: AuthenticatedUser) {
    const scope = this.requireAppScope(actor);
    const item = await this.find(id);
    const read = await this.prisma.notificationRead.findFirst({
      where: {
        notificationId: id,
        accountId: scope.accountId,
        studentId: scope.studentId,
      },
    });
    return ok({ ...this.toDto(item), attachments: [], is_read: Boolean(read) });
  }

  async markAsRead(id: string, actor?: AuthenticatedUser) {
    const scope = this.requireAppScope(actor);
    await this.find(id);
    await this.prisma.notificationRead.upsert({
      where: {
        notificationId_studentId_accountId: {
          notificationId: id,
          studentId: scope.studentId,
          accountId: scope.accountId,
        },
      },
      create: {
        notificationId: id,
        studentId: scope.studentId,
        accountId: scope.accountId,
      },
      update: {},
    });
    return ok({ is_read: true });
  }

  private where(q?: string, tag?: string): Prisma.NotificationWhereInput {
    return {
      ...(tag ? { tag } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' as const } },
              { content: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
  }
  private page(value?: string | number) {
    return Math.max(Number(value) || 1, 1);
  }
  private pageSize(value?: string | number) {
    return Math.min(Math.max(Number(value) || 20, 1), 100);
  }
  private async find(id: string) {
    const item = await this.prisma.notification.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Khong tim thay thong bao');
    return item;
  }
  private requireAdmin(actor?: AuthenticatedUser) {
    if (!actor || !['admin', 'super_admin'].includes(actor.role))
      throw new ForbiddenException('Admin role required');
    return actor;
  }
  private required(value?: string) {
    if (!value) throw new ForbiddenException('Validated field is required');
    return value;
  }
  private requireAppScope(actor?: AuthenticatedUser) {
    if (!actor?.id || !actor.activeStudentId) {
      throw new ForbiddenException('Active student is required');
    }
    return { accountId: actor.id, studentId: actor.activeStudentId };
  }
  private toDto(item: {
    id: string;
    title: string;
    sender: string;
    sentAt: Date;
    content: string;
    tag: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: item.id,
      title: item.title,
      sender: item.sender,
      sent_at: item.sentAt.toISOString(),
      content: item.content,
      tag: item.tag,
      created_at: item.createdAt.toISOString(),
      updated_at: item.updatedAt.toISOString(),
    };
  }
  private auditMutation(
    actorId: string,
    action: string,
    resourceId: string,
    client: Prisma.TransactionClient,
  ) {
    return this.audit.record(
      {
        actorId,
        action: `communication.notifications.${action}`,
        boundedContext: 'Communication',
        resourceType: 'notification',
        resourceId,
      },
      client,
    );
  }
}
