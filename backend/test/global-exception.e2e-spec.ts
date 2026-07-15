import { Controller, Get, INestApplication, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { GlobalExceptionFilter } from '../src/common/http/global-exception.filter';

@Controller()
class FailureController {
  @Get('failure')
  fail(): never {
    throw new Error('sensitive internal detail');
  }
}

@Module({
  controllers: [FailureController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
class TestAppModule {}

describe('Global exception filter (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('normalizes framework 404 responses', async () => {
    await request(app.getHttpServer())
      .get('/missing')
      .set('x-request-id', 'request-404')
      .expect(404)
      .expect({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Cannot GET /missing',
        },
        request_id: 'request-404',
      });
  });

  it('normalizes unknown errors without exposing internal details', async () => {
    await request(app.getHttpServer())
      .get('/failure')
      .expect(500)
      .expect({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
        },
      });
  });
});
