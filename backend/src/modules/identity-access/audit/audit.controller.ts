import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { z } from 'zod';
import { RequirePermission } from '../../../common/auth/require-permission.decorator';
import { RequireRole } from '../../../common/auth/require-role.decorator';
import { AuditService } from './audit.service';

const listAuditLogsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    actor_id: z.string().trim().min(1).optional(),
    action: z.string().trim().min(1).optional(),
    bounded_context: z.string().trim().min(1).optional(),
    resource_type: z.string().trim().min(1).optional(),
    resource_id: z.string().trim().min(1).optional(),
    from: z.string().trim().datetime({ offset: true }).optional(),
    to: z.string().trim().datetime({ offset: true }).optional(),
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        return new Date(data.from).getTime() <= new Date(data.to).getTime();
      }
      return true;
    },
    {
      message: 'from date must be less than or equal to to date',
      path: ['from'],
    },
  );

export function validateListAuditLogsQuery(payload: unknown) {
  const result = listAuditLogsQuerySchema.safeParse(payload);
  if (!result.success) {
    throw new BadRequestException({
      message: 'Validation failed',
      issues: result.error.issues,
    });
  }
  return {
    page: result.data.page ?? 1,
    limit: result.data.limit ?? 20,
    ...result.data,
  };
}

@Controller('api/v1/admin/audit-logs')
@RequireRole('admin', 'super_admin')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermission('identity.audit.read')
  listAuditLogs(@Query() query: unknown) {
    return this.auditService.listAuditLogs(validateListAuditLogsQuery(query));
  }
}
