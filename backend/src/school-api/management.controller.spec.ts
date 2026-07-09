import { InternalServerErrorException, Logger } from '@nestjs/common';
import { ManagementController } from './management.controller';

describe('ManagementController admin management API logging', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs request start and success with structured keys only', async () => {
    const service = {
      list: jest.fn().mockResolvedValue({ items: [], pagination: { page: 1, limit: 20, total: 0 } }),
    } as never;
    const controller = new ManagementController(service);

    await expect(
      controller.list('students', { keyword: 'abc', limit: '20' }),
    ).resolves.toEqual({
      success: true,
      message: 'OK',
      data: { items: [], pagination: { page: 1, limit: 20, total: 0 } },
    });

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: 'admin-management-api',
        event: 'request_start',
        action: 'list',
        domain: 'students',
        id: undefined,
        queryKeys: ['keyword', 'limit'],
        payloadKeys: undefined,
        durationMs: undefined,
        error: undefined,
      }),
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: 'admin-management-api',
        event: 'request_success',
        action: 'list',
        domain: 'students',
        id: undefined,
        queryKeys: ['keyword', 'limit'],
        payloadKeys: undefined,
        durationMs: expect.any(Number),
        error: undefined,
      }),
    );
    expect(JSON.stringify(logSpy.mock.calls)).not.toContain('abc');
  });

  it('logs request failures with sanitized error text and payload keys only', async () => {
    const service = {
      update: jest.fn().mockRejectedValue(new InternalServerErrorException('DATABASE_URL postgresql://user:placeholder@localhost/db failed')),
    } as never;
    const controller = new ManagementController(service);

    await expect(
      controller.update('news', 'news-1', { title: 'Private title', password: 'do-not-log' }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: 'admin-management-api',
        event: 'request_failed',
        action: 'update',
        domain: 'news',
        id: 'news-1',
        queryKeys: undefined,
        payloadKeys: ['password', 'title'],
        durationMs: expect.any(Number),
        error: 'DATABASE_URL [REDACTED_CONNECTION_STRING] failed',
      }),
    );
    const logged = JSON.stringify(errorSpy.mock.calls);
    expect(logged).not.toContain('do-not-log');
    expect(logged).not.toContain('placeholder');
    expect(logged).not.toContain('postgresql://user:placeholder@localhost/db');
  });
});
