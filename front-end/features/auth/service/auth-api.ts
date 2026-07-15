import { z } from "zod";
import { backendFetch } from "@/lib/api/backend";
import { accountSchema, authTokensSchema, parseApiResponse, successSchema } from "@/lib/api/schemas";

export const credentialsSchema = z.object({
  username: z.string().trim().min(1, "Vui lòng nhập tài khoản."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

const loginResponseSchema = successSchema(authTokensSchema.extend({ account: accountSchema }));
const refreshResponseSchema = successSchema(authTokensSchema);

export type AuthAccount = z.infer<typeof accountSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;

export async function login(input: z.infer<typeof credentialsSchema>) {
  const payload = credentialsSchema.parse(input);
  const response = await backendFetch("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, loginResponseSchema)).data;
}

export async function refresh(refreshToken: string): Promise<AuthTokens> {
  const response = await backendFetch("/api/v1/auth/refresh-token", {
    method: "POST",
    body: JSON.stringify({ refresh_token: z.string().min(1).parse(refreshToken) }),
  });
  return (await parseApiResponse(response, refreshResponseSchema)).data;
}

export async function logout(accessToken: string): Promise<void> {
  await backendFetch("/api/v1/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({}),
  });
}
