import { z } from "zod";
import { parseApiResponse, successSchema } from "@/lib/api/schemas";

export const notificationItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  sender: z.string(),
  sent_at: z.string(),
  content: z.string(),
  tag: z.string(),
  created_at: z.string().optional(),
});

const notificationListSchema = successSchema(
  z.object({
    items: z.array(notificationItemSchema),
    total: z.number().optional(),
    page: z.number().optional(),
    page_size: z.number().optional(),
  })
);

export type NotificationItem = z.infer<typeof notificationItemSchema>;
export type CreateNotificationPayload = {
  title: string;
  sender: string;
  content: string;
  tag?: string;
};

export async function listNotifications(query = ""): Promise<{ items: NotificationItem[]; total?: number }> {
  const response = await fetch(`/api/admin/notifications${query}`, { cache: "no-store" });
  const parsed = await parseApiResponse(response, notificationListSchema);
  return {
    items: parsed.data.items,
    total: parsed.data.total ?? parsed.data.items.length,
  };
}

export async function createNotification(payload: CreateNotificationPayload): Promise<NotificationItem> {
  const response = await fetch("/api/admin/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(notificationItemSchema))).data;
}
