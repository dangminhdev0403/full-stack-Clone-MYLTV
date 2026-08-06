import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { z } from 'zod';
import { RequirePermission } from '../../../common/auth/require-permission.decorator';
import { RequireRole } from '../../../common/auth/require-role.decorator';
import { AuditService } from './audit.service';

const listAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  action: z.string().trim().min(1).optional(),
  actor_id: z.string().trim().min(1).optional(),
  resource_type: z.string().trim().min(1).optional(),
});

export function validateListAuditLogsQuery(payload: unknown) {
  const result = listAuditLogsQuerySchema.safeParse(payload);
  if (!result.success) {
    throw new BadRequestException({
      message: 'Validation failed',
      issues: result.error.issues,
    });
  }
  return result.data;
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
