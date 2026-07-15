import { z } from "zod";
import { parseApiResponse, successSchema, userSchema } from "@/lib/api/schemas";

const listSchema = successSchema(z.object({ items: z.array(userSchema), page: z.number(), page_size: z.number(), total: z.number() }));
export type User = z.infer<typeof userSchema>;
export type UpdateUserPayload = Partial<Pick<User, "display_name" | "role" | "is_active">> & {
  permission_keys?: string[];
};

export async function listUsers(query = ""): Promise<z.infer<typeof listSchema>["data"]> {
  const response = await fetch(`/api/admin/users${query}`, { cache: "no-store" });
  return (await parseApiResponse(response, listSchema)).data;
}

export async function createUser(payload: { username: string; display_name: string; role: User["role"]; password: string; permission_keys: string[] }): Promise<User> {
  const response = await mutate("/api/admin/users", "POST", payload);
  return (await parseApiResponse(response, successSchema(userSchema))).data;
}

export async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, { cache: "no-store" });
  return (await parseApiResponse(response, successSchema(userSchema))).data;
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
  const response = await mutate(`/api/admin/users/${encodeURIComponent(id)}`, "PATCH", payload);
  return (await parseApiResponse(response, successSchema(userSchema))).data;
}

export async function disableUser(id: string): Promise<{ disabled: true }> {
  const response = await mutate(`/api/admin/users/${encodeURIComponent(id)}/disable`, "POST");
  return (await parseApiResponse(response, successSchema(z.object({ disabled: z.literal(true) })))).data;
}

export async function resetUserPassword(id: string, password: string): Promise<{ reset: true }> {
  const response = await mutate(`/api/admin/users/${encodeURIComponent(id)}/reset-password`, "POST", { password });
  return (await parseApiResponse(response, successSchema(z.object({ reset: z.literal(true) })))).data;
}

function mutate(path: string, method: "POST" | "PATCH", payload?: unknown): Promise<Response> {
  return fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
  });
}
