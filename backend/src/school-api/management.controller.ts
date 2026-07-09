import { Body, Controller, Get, Logger, Param, Patch, Post, Query } from '@nestjs/common';
import { ok } from '../common/api-response';
import { ManagementService } from './management.service';

const CONNECTION_STRING_PATTERN = /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/\S+/gi;

type AdminManagementLogEvent = 'request_start' | 'request_success' | 'request_failed';

type AdminManagementLogContext = {
  scope: 'admin-management-api';
  event: AdminManagementLogEvent;
  action: string;
  domain: string;
  id: string | undefined;
  queryKeys: string[] | undefined;
  payloadKeys: string[] | undefined;
  durationMs: number | undefined;
  error: string | undefined;
};

@Controller('api/v1/admin/management')
export class ManagementController {
  private readonly logger = new Logger(ManagementController.name);

  constructor(private readonly managementService: ManagementService) {}

  @Get()
  async inventory() {
    // Admin management CRUD verification is not code inspection only: valid verification includes real frontend/browser CRUD flow list/read -> create -> detail -> update -> backend state confirmation.
    return this.logged('inventory', 'all', undefined, undefined, () => this.managementService.inventory());
  }

  @Get(':domain')
  async list(
    @Param('domain') domain: string,
    @Query() query: Record<string, unknown>,
  ) {
    return this.logged('list', domain, undefined, query, () => this.managementService.list(domain, query));
  }

  @Get(':domain/:id')
  async detail(@Param('domain') domain: string, @Param('id') id: string) {
    return this.logged('detail', domain, id, undefined, () => this.managementService.detail(domain, id));
  }

  @Post(':domain')
  async create(
    @Param('domain') domain: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.logged('create', domain, undefined, undefined, () => this.managementService.create(domain, body), body);
  }

  @Patch(':domain/:id')
  async update(
    @Param('domain') domain: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.logged('update', domain, id, undefined, () => this.managementService.update(domain, id, body), body);
  }

  private async logged<T>(
    action: string,
    domain: string,
    id: string | undefined,
    query: Record<string, unknown> | undefined,
    handler: () => Promise<T> | T,
    body?: Record<string, unknown>,
  ) {
    const startedAt = Date.now();
    const context: Omit<AdminManagementLogContext, 'event' | 'durationMs' | 'error'> = {
      scope: 'admin-management-api',
      action,
      domain,
      id,
      queryKeys: query ? Object.keys(query).sort() : undefined,
      payloadKeys: body ? Object.keys(body).sort() : undefined,
    };

    this.logger.log(this.logContext(context, 'request_start'));

    try {
      const data = await handler();
      this.logger.log(this.logContext(context, 'request_success', Date.now() - startedAt));
      return ok(data);
    } catch (error) {
      this.logger.error(this.logContext(context, 'request_failed', Date.now() - startedAt, this.safeError(error)));
      throw error;
    }
  }

  private logContext(
    context: Omit<AdminManagementLogContext, 'event' | 'durationMs' | 'error'>,
    event: AdminManagementLogEvent,
    durationMs?: number,
    error?: string,
  ): AdminManagementLogContext {
    return {
      ...context,
      event,
      durationMs,
      error,
    };
  }

  private safeError(error: unknown) {
    if (!(error instanceof Error)) return 'Unknown error';

    const response = 'getResponse' in error && typeof error.getResponse === 'function' ? error.getResponse() : undefined;
    const message = typeof response === 'object' && response !== null && 'message' in response ? response.message : error.message;
    const text = Array.isArray(message) ? message.join('; ') : String(message || 'Unknown error');

    return text.replace(CONNECTION_STRING_PATTERN, '[REDACTED_CONNECTION_STRING]');
  }
}
