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
}
