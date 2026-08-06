import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from './audit.service';

describe('AuditService', () => {
  let service: AuditService;
  let prismaService: {
    auditEvent: {
      create: jest.Mock;
      count: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaService = {
      auditEvent: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
        count: jest.fn().mockResolvedValue(2),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'audit-1',
            actorId: 'actor-1',
            action: 'LOGIN',
            boundedContext: 'identity_access',
            resourceType: 'account',
            resourceId: 'acc-1',
            metadata: {
              password: 'secret_password_123',
              user_token: 'jwt.token.val',
              api_key: 'key-999',
              apiKey: 'key-998',
              authorization_header: 'Bearer xyz',
              client_secret: 'sec-111',
              user_credential: 'cred-val',
              nested: {
                auth_token: 'nested-token',
                safe_info: 'safe',
              },
              array_data: [
                { token_id: 't-1', name: 'Item 1' },
                { safe_key: 123 },
              ],
              safe_field: 'normal_value',
            },
            createdAt: new Date('2026-08-05T10:00:00Z'),
          },
          {
            id: 'audit-2',
            actorId: 'actor-2',
            action: 'UPDATE_ROLE',
            boundedContext: 'identity_access',
            resourceType: 'role',
            resourceId: 'role-1',
            metadata: null,
            createdAt: new Date('2026-08-04T10:00:00Z'),
          },
        ]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get(AuditService);
  });

  describe('record', () => {
    it('creates an audit event with specified payload', async () => {
      const event = {
        actorId: 'actor-100',
        action: 'UPDATE_USER',
        boundedContext: 'identity_access',
        resourceType: 'user',
        resourceId: 'user-200',
        metadata: { role: 'admin' },
      };

      await service.record(event);

      expect(prismaService.auditEvent.create).toHaveBeenCalledWith({
        data: {
          actorId: 'actor-100',
          action: 'UPDATE_USER',
          boundedContext: 'identity_access',
          resourceType: 'user',
          resourceId: 'user-200',
          metadata: { role: 'admin' },
        },
        select: { id: true },
      });
    });
  });

  describe('listAuditLogs', () => {
    it('queries prisma count and findMany with default pagination and ordering by createdAt desc then id desc', async () => {
      const result = await service.listAuditLogs({});

      expect(prismaService.auditEvent.count).toHaveBeenCalledWith({
        where: {},
      });
      expect(prismaService.auditEvent.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      });

      expect(result.data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        total_pages: 1,
      });
    });

    it('applies exact filters for action, actor_id, bounded_context, resource_type, resource_id and date range gte/lte', async () => {
      await service.listAuditLogs({
        page: 2,
        limit: 10,
        action: 'LOGIN',
        actor_id: 'actor-1',
        bounded_context: 'identity_access',
        resource_type: 'account',
        resource_id: 'acc-1',
        from: '2026-08-01T00:00:00.000Z',
        to: '2026-08-05T23:59:59.999Z',
      });

      const expectedWhere = {
        action: 'LOGIN',
        actorId: 'actor-1',
        boundedContext: 'identity_access',
        resourceType: 'account',
        resourceId: 'acc-1',
        createdAt: {
          gte: new Date('2026-08-01T00:00:00.000Z'),
          lte: new Date('2026-08-05T23:59:59.999Z'),
        },
      };

      expect(prismaService.auditEvent.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(prismaService.auditEvent.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        skip: 10,
        take: 10,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      });
    });

    it('recursively redacts metadata keys containing password, token, secret, authorization, credential, api_key while preserving safe values', async () => {
      const result = await service.listAuditLogs({});
      const item1Metadata = result.data.audit_logs[0].metadata as Record<
        string,
        unknown
      >;

      expect(item1Metadata.password).toBe('[REDACTED]');
      expect(item1Metadata.user_token).toBe('[REDACTED]');
      expect(item1Metadata.api_key).toBe('[REDACTED]');
      expect(item1Metadata.apiKey).toBe('[REDACTED]');
      expect(item1Metadata.authorization_header).toBe('[REDACTED]');
      expect(item1Metadata.client_secret).toBe('[REDACTED]');
      expect(item1Metadata.user_credential).toBe('[REDACTED]');
      expect(item1Metadata.safe_field).toBe('normal_value');

      const nestedObj = item1Metadata.nested as Record<string, unknown>;
      expect(nestedObj.auth_token).toBe('[REDACTED]');
      expect(nestedObj.safe_info).toBe('safe');

      const arrayData = item1Metadata.array_data as Array<
        Record<string, unknown>
      >;
      expect(arrayData[0].token_id).toBe('[REDACTED]');
      expect(arrayData[0].name).toBe('Item 1');
      expect(arrayData[1].safe_key).toBe(123);

      const item2Metadata = result.data.audit_logs[1].metadata;
      expect(item2Metadata).toBeNull();
    });
  });
});
