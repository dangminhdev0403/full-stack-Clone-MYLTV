import { Test } from '@nestjs/testing';
import { clearEnvConfigCacheForTest } from '../config/env.config';
import { PrismaService } from './prisma.service';

const ORIGINAL_DATABASE_URL = process.env.DATABASE_URL;

describe('PrismaService', () => {
  beforeEach(() => {
    clearEnvConfigCacheForTest();
  });

  afterEach(() => {
    if (ORIGINAL_DATABASE_URL === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = ORIGINAL_DATABASE_URL;
    }
    clearEnvConfigCacheForTest();
  });

  it('constructs PrismaClient with the PostgreSQL adapter from DATABASE_URL', () => {
    process.env.DATABASE_URL =
      'postgresql://localhost:5432/education_db?schema=public';

    expect(() => new PrismaService()).not.toThrow();
  });

  it('can be instantiated by Nest dependency injection', async () => {
    process.env.DATABASE_URL =
      'postgresql://localhost:5432/education_db?schema=public';

    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    const service = moduleRef.get(PrismaService);

    expect(service).toBeDefined();
    expect(service.$connect).toEqual(expect.any(Function));
    await moduleRef.close();
  });

  it('throws a non-secret configuration error when DATABASE_URL is missing', () => {
    delete process.env.DATABASE_URL;

    expect(() => new PrismaService()).toThrow(
      'Invalid backend environment: missing required key DATABASE_URL',
    );
  });
});
