import { z } from "zod";

const ConfigSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .trim()
    .min(1, "NEXT_PUBLIC_API_BASE_URL is required")
    .url("NEXT_PUBLIC_API_BASE_URL must be a valid URL")
    .refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
      message: "NEXT_PUBLIC_API_BASE_URL must use http or https",
    }),
});

export type FrontendEnvConfig = {
  apiBaseUrl: string;
  validatedKeys: ["NEXT_PUBLIC_API_BASE_URL"];
};

type FrontendEnvInput = Partial<Record<keyof z.infer<typeof ConfigSchema>, string | undefined>>;
type RuntimeEnvInput = FrontendEnvInput & Record<string, string | undefined>;

export function getFrontendEnvConfig(env: FrontendEnvInput = readRuntimeEnv()): FrontendEnvConfig {
  return createFrontendEnvConfig(env);
}

export function createFrontendEnvConfig(env: FrontendEnvInput): FrontendEnvConfig {
  const parsed = ConfigSchema.safeParse(env);

  if (!parsed.success) {
    throw new Error(`Invalid frontend environment variables: ${z.prettifyError(parsed.error)}`);
  }

  return {
    apiBaseUrl: new URL(parsed.data.NEXT_PUBLIC_API_BASE_URL).origin,
    validatedKeys: ["NEXT_PUBLIC_API_BASE_URL"],
  };
}

function readRuntimeEnv(): RuntimeEnvInput {
  return {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  };
}
