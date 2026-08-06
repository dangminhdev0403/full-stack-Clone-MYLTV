import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

export type RecordAuditEvent = {
  actorId: string;
  action: string;
  boundedContext: string;
  resourceType: string;
  resourceId: string;
  metadata?: Prisma.InputJsonValue;
};

export type ListAuditLogsQueryDto = {
  page?: number;
  limit?: number;
  action?: string;
  actor_id?: string;
  resource_type?: string;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(
    event: RecordAuditEvent,
    client: Pick<PrismaService, 'auditEvent'> = this.prisma,
  ): Promise<void> {
    await client.auditEvent.create({
      data: {
        actorId: event.actorId,
        action: event.action,
        boundedContext: event.boundedContext,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        ...(event.metadata !== undefined ? { metadata: event.metadata } : {}),
      },
      select: { id: true },
    });
  }

  async listAuditLogs(query: ListAuditLogsQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.AuditEventWhereInput = {
      ...(query.action ? { action: query.action } : {}),
      ...(query.actor_id ? { actorId: query.actor_id } : {}),
      ...(query.resource_type ? { resourceType: query.resource_type } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.auditEvent.count({ where }),
      this.prisma.auditEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: {
        audit_logs: items.map((item) => ({
          id: item.id,
          actor_id: item.actorId,
          action: item.action,
          bounded_context: item.boundedContext,
          resource_type: item.resourceType,
          resource_id: item.resourceId,
          metadata: item.metadata,
          created_at: item.createdAt.toISOString(),
        })),
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      },
    };
  }
}
