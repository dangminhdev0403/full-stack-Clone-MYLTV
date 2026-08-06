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
  bounded_context?: string;
  resource_type?: string;
  resource_id?: string;
  from?: string;
  to?: string;
};

const SENSITIVE_KEY_PATTERNS = [
  'password',
  'token',
  'secret',
  'authorization',
  'credential',
  'api_key',
];

function isSensitiveKey(key: string): boolean {
  const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  return SENSITIVE_KEY_PATTERNS.some((pattern) =>
    normalizedKey.includes(pattern.replace(/_/g, '')),
  );
}

function redactMetadata(val: unknown): unknown {
  if (val === null || val === undefined || typeof val !== 'object') {
    return val;
  }

  if (Array.isArray(val)) {
    return val.map((item) => redactMetadata(item));
  }

  const obj = val as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(obj)) {
    if (isSensitiveKey(k)) {
      result[k] = '[REDACTED]';
    } else {
      result[k] = redactMetadata(v);
    }
  }

  return result;
}

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
      ...(query.bounded_context
        ? { boundedContext: query.bounded_context }
        : {}),
      ...(query.resource_type ? { resourceType: query.resource_type } : {}),
      ...(query.resource_id ? { resourceId: query.resource_id } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.auditEvent.count({ where }),
      this.prisma.auditEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
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
          metadata: redactMetadata(item.metadata),
          created_at: item.createdAt.toISOString(),
        })),
        pagination: {
          page,
          limit,
          total,
          total_pages: total === 0 ? 0 : Math.ceil(total / limit),
        },
      },
    };
  }
}
