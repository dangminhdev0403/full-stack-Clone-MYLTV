import { z } from "zod";
import { parseApiResponse, successSchema } from "@/lib/api/schemas";

export const auditLogSchema = z.object({
  id: z.string(),
  actor_id: z.string(),
  action: z.string(),
  bounded_context: z.string(),
  resource_type: z.string(),
  resource_id: z.string(),
  metadata: z.unknown().optional(),
  created_at: z.string(),
});

const listAuditLogsResponseSchema = successSchema(z.object({
  audit_logs: z.array(auditLogSchema),
  pagination: z.object({ page: z.number(), limit: z.number(), total: z.number(), total_pages: z.number() }),
}));

export type AuditLog = z.infer<typeof auditLogSchema>;
export type ListAuditLogsQuery = {
  page?: number;
  limit?: number;
  actor_id?: string;
  action?: string;
  bounded_context?: string;
  resource_type?: string;
  resource_id?: string;
  from?: string;
  to?: string;
};

export async function listAuditLogs(query: ListAuditLogsQuery = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value !== undefined && value !== "") params.set(key, String(value));
  const response = await fetch(`/api/admin/audit-logs${params.size ? `?${params}` : ""}`, { cache: "no-store" });
  return (await parseApiResponse(response, listAuditLogsResponseSchema)).data;
}
