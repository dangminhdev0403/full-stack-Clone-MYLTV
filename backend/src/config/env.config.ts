export type BackendEnvConfig = {
  databaseUrl: string;
  port: number;
};

type EnvSource = NodeJS.ProcessEnv | Record<string, string | undefined>;

const REQUIRED_KEYS = ['DATABASE_URL'] as const;
const DEFAULT_PORT = 3000;
let cachedConfig: BackendEnvConfig | undefined;

export function validateBackendEnv(
  env: EnvSource = process.env,
): BackendEnvConfig {
  const missingKeys = REQUIRED_KEYS.filter((key) => !nonBlank(env[key]));

  if (missingKeys.length > 0) {
    throw new Error(
      `Invalid backend environment: missing required key${missingKeys.length === 1 ? '' : 's'} ${missingKeys.join(', ')}`,
    );
  }

  const port = parsePort(env.PORT);

  return {
    databaseUrl: env.DATABASE_URL as string,
    port,
  };
}

export function getBackendEnvConfig(): BackendEnvConfig {
  cachedConfig ??= validateBackendEnv(process.env);
  return cachedConfig;
}

export function clearEnvConfigCacheForTest() {
  cachedConfig = undefined;
}

function nonBlank(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function parsePort(value: string | undefined): number {
  if (!nonBlank(value)) return DEFAULT_PORT;

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(
      'Invalid backend environment: PORT must be an integer between 1 and 65535',
    );
  }

  return parsed;
}
