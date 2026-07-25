import { z } from "zod";
import { parseApiResponse, successSchema } from "@/lib/api/schemas";

export const adminEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  start_at: z.string(),
  end_at: z.string(),
  location: z.string().nullable().optional(),
  registration_deadline: z.string().nullable().optional(),
  status: z.string(),
  registration_count: z.number().optional(),
  created_at: z.string().optional(),
});

const eventsListSchema = successSchema(
  z.object({
    items: z.array(adminEventSchema),
    total: z.number().optional(),
    page: z.number().optional(),
    page_size: z.number().optional(),
  })
);

export type AdminEvent = z.infer<typeof adminEventSchema>;
export type CreateEventPayload = {
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  location?: string;
  registration_deadline?: string;
  status?: string;
};

export async function listAdminEvents(query = ""): Promise<{ items: AdminEvent[]; total?: number }> {
  const response = await fetch(`/api/admin/events${query}`, { cache: "no-store" });
  const parsed = await parseApiResponse(response, eventsListSchema);
  return {
    items: parsed.data.items,
    total: parsed.data.total ?? parsed.data.items.length,
  };
}

export async function createAdminEvent(payload: CreateEventPayload): Promise<AdminEvent> {
  const response = await fetch("/api/admin/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(adminEventSchema))).data;
}

export async function deleteAdminEvent(id: string): Promise<void> {
  const response = await fetch(`/api/admin/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete event");
  }
}
