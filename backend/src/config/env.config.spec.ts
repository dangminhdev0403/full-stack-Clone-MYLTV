import {
  clearEnvConfigCacheForTest,
  getBackendEnvConfig,
  validateBackendEnv,
} from './env.config';

const ORIGINAL_ENV = process.env;

describe('backend environment config validation', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    clearEnvConfigCacheForTest();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    clearEnvConfigCacheForTest();
  });

  it('returns validated DATABASE_URL and numeric PORT without logging secret values', () => {
    const config = validateBackendEnv({
      DATABASE_URL: 'postgresql://user:placeholder@localhost:5432/education_db?schema=public',
      PORT: '4000',
    });

    expect(config).toEqual({
      databaseUrl: 'postgresql://user:placeholder@localhost:5432/education_db?schema=public',
      port: 4000,
    });
  });

  it('fails with key names only when required env keys are missing', () => {
    expect(() => validateBackendEnv({ PORT: '3000' })).toThrow(
      'Invalid backend environment: missing required key DATABASE_URL',
    );
  });

  it('fails with key names only when PORT is invalid', () => {
    expect(() =>
      validateBackendEnv({
        DATABASE_URL: 'postgresql://user:placeholder@localhost:5432/education_db?schema=public',
        PORT: 'not-a-port',
      }),
    ).toThrow('Invalid backend environment: PORT must be an integer between 1 and 65535');
  });

  it('caches validated process env for runtime consumers', () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/education_db?schema=public';
    process.env.PORT = '3333';

    expect(getBackendEnvConfig()).toEqual({
      databaseUrl: 'postgresql://localhost:5432/education_db?schema=public',
      port: 3333,
    });

    delete process.env.DATABASE_URL;

    expect(getBackendEnvConfig().databaseUrl).toBe(
      'postgresql://localhost:5432/education_db?schema=public',
    );
  });
});
