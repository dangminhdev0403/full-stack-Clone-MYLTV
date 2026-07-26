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
  FeedbackAdminListQuery,
  FeedbackStatusCommand,
} from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(query: FeedbackAdminListQuery) {
    const where = this.where(query);
    const skip = (query.page - 1) * query.page_size;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.feedbackItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.page_size,
      }),
      this.prisma.feedbackItem.count({ where }),
    ]);

    return ok({
      items: items.map((item) => this.toDto(item)),
      page: query.page,
      page_size: query.page_size,
      total,
      has_next: query.page * query.page_size < total,
    });
  }

  async detail(id: string) {
    return ok(this.toDto(await this.find(id)));
  }

  async updateStatus(
    id: string,
    command: FeedbackStatusCommand,
    actor?: AuthenticatedUser,
  ) {
    const admin = this.requireAdmin(actor);
    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.feedbackItem.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Khong tim thay phan hoi');

        const item = await tx.feedbackItem.update({
          where: { id },
          data: { status: command.status },
        });
        await this.audit.record(
          {
            actorId: admin.id,
            action: 'communication.feedback.update_status',
            boundedContext: 'Communication',
            resourceType: 'feedback',
            resourceId: id,
            metadata: {
              previous_status: existing.status,
              status: command.status,
            },
          },
          tx,
        );
        return item;
      });

      return ok(this.toDto(updated));
    } catch (error: unknown) {
      if (this.isRecordNotFound(error)) {
        throw new NotFoundException('Khong tim thay phan hoi');
      }
      throw error;
    }
  }

  private where(query: FeedbackAdminListQuery): Prisma.FeedbackItemWhereInput {
    return {
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { content: { contains: query.q, mode: 'insensitive' } },
              { category: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
  }

  private async find(id: string) {
    const item = await this.prisma.feedbackItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Khong tim thay phan hoi');
    return item;
  }

  private requireAdmin(actor?: AuthenticatedUser) {
    if (!actor || !['admin', 'super_admin'].includes(actor.role)) {
      throw new ForbiddenException('Admin role required');
    }
    return actor;
  }

  private isRecordNotFound(error: unknown): error is { code: 'P2025' } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2025'
    );
  }

  private toDto(item: {
    id: string;
    studentId: string | null;
    accountId: string | null;
    title: string;
    content: string;
    category: string;
    status: string;
    attachmentsJson: unknown;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: item.id,
      student_id: item.studentId,
      account_id: item.accountId,
      title: item.title,
      content: item.content,
      category: item.category,
      status: item.status,
      attachments: item.attachmentsJson ?? [],
      created_at: item.createdAt.toISOString(),
      updated_at: item.updatedAt.toISOString(),
    };
  }
}
