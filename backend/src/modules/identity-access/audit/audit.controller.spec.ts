import { BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import {
  REQUIRED_PERMISSIONS_KEY,
  REQUIRED_ROLES_KEY,
} from '../../../common/auth/auth.constants';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

describe('AuditController', () => {
  let controller: AuditController;
  let auditService: jest.Mocked<Partial<AuditService>>;
  let reflector: Reflector;

  beforeEach(async () => {
    auditService = {
      listAuditLogs: jest.fn().mockResolvedValue({
        data: {
          audit_logs: [],
          pagination: { page: 1, limit: 20, total: 0, total_pages: 0 },
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        {
          provide: AuditService,
          useValue: auditService,
        },
      ],
    }).compile();

    controller = module.get(AuditController);
    reflector = new Reflector();
  });

  /* eslint-disable @typescript-eslint/unbound-method */
  describe('Route Metadata & Auth Decorators', () => {
    it('has RequireRole admin and super_admin on the class', () => {
      const roles = reflector.get<string[]>(
        REQUIRED_ROLES_KEY,
        AuditController,
      );
      expect(roles).toEqual(['admin', 'super_admin']);
    });

    it('has RequirePermission identity.audit.read on listAuditLogs', () => {
      const permissions = reflector.get<string[]>(
        REQUIRED_PERMISSIONS_KEY,
        AuditController.prototype.listAuditLogs,
      );
      expect(permissions).toEqual(['identity.audit.read']);
    });
  });
  /* eslint-enable @typescript-eslint/unbound-method */

  describe('Validation (Negative Cases)', () => {
    it('throws BadRequestException on page <= 0 or invalid integer', () => {
      expect(() => controller.listAuditLogs({ page: 0 })).toThrow(
        BadRequestException,
      );
      expect(() => controller.listAuditLogs({ page: -5 })).toThrow(
        BadRequestException,
      );
      expect(() => controller.listAuditLogs({ page: 'abc' })).toThrow(
        BadRequestException,
      );
      expect(auditService.listAuditLogs).not.toHaveBeenCalled();
    });

    it('throws BadRequestException on limit <= 0 or > 100', () => {
      expect(() => controller.listAuditLogs({ limit: 0 })).toThrow(
        BadRequestException,
      );
      expect(() => controller.listAuditLogs({ limit: 101 })).toThrow(
        BadRequestException,
      );
      expect(() => controller.listAuditLogs({ limit: 'invalid' })).toThrow(
        BadRequestException,
      );
      expect(auditService.listAuditLogs).not.toHaveBeenCalled();
    });

    it('throws BadRequestException on invalid ISO datetime from or to', () => {
      expect(() => controller.listAuditLogs({ from: 'not-a-date' })).toThrow(
        BadRequestException,
      );
      expect(() => controller.listAuditLogs({ from: '2026-08-01' })).toThrow(
        BadRequestException,
      );
      expect(() => controller.listAuditLogs({ to: '2026-99-99' })).toThrow(
        BadRequestException,
      );
      expect(auditService.listAuditLogs).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when from > to in date range validation', () => {
      expect(() =>
        controller.listAuditLogs({
          from: '2026-08-10T00:00:00.000Z',
          to: '2026-08-01T00:00:00.000Z',
        }),
      ).toThrow(BadRequestException);
      expect(auditService.listAuditLogs).not.toHaveBeenCalled();
    });
  });

  describe('Delegation & Query Parsing (Positive Cases)', () => {
    it('delegates empty query with defaults to auditService.listAuditLogs', async () => {
      await controller.listAuditLogs({});
      expect(auditService.listAuditLogs).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      });
    });

    it('delegates query with all valid filters and valid date range from <= to', async () => {
      const query = {
        page: '2',
        limit: '50',
        actor_id: '  actor-123  ',
        action: '  USER_LOGIN  ',
        bounded_context: '  identity_access  ',
        resource_type: '  account  ',
        resource_id: '  res-456  ',
        from: '2026-08-01T00:00:00.000Z',
        to: '2026-08-10T23:59:59.999Z',
      };

      await controller.listAuditLogs(query);

      expect(auditService.listAuditLogs).toHaveBeenCalledWith({
        page: 2,
        limit: 50,
        actor_id: 'actor-123',
        action: 'USER_LOGIN',
        bounded_context: 'identity_access',
        resource_type: 'account',
        resource_id: 'res-456',
        from: '2026-08-01T00:00:00.000Z',
        to: '2026-08-10T23:59:59.999Z',
      });
    });
  });
});
