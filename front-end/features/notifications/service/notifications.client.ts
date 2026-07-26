import { z } from "zod";
import { parseApiResponse, successSchema } from "@/lib/api/schemas";

export const notificationItemSchema = z.object({
  id: z.string(), title: z.string(), sender: z.string(), sent_at: z.string(), content: z.string(), tag: z.string(),
  is_read: z.boolean().optional(), created_at: z.string().optional(), updated_at: z.string().optional(),
});
const notificationListSchema = successSchema(z.object({
  items: z.array(notificationItemSchema), page: z.number(), page_size: z.number(), total: z.number(), has_next: z.boolean(),
}));

export type NotificationItem = z.infer<typeof notificationItemSchema>;
export type NotificationWritePayload = { title?: string; sender?: string; content?: string; tag?: string };
export type CreateNotificationPayload = Required<Pick<NotificationWritePayload, "title" | "sender" | "content">> & Pick<NotificationWritePayload, "tag">;
export type NotificationList = { items: NotificationItem[]; page: number; page_size: number; total: number; has_next: boolean };

export async function listNotifications(query = ""): Promise<NotificationList> {
  const response = await fetch(`/api/admin/notifications${query}`, { cache: "no-store" });
  return (await parseApiResponse(response, notificationListSchema)).data;
}
export async function getNotification(id: string): Promise<NotificationItem> {
  const response = await fetch(`/api/admin/notifications/${encodeURIComponent(id)}`, { cache: "no-store" });
  return (await parseApiResponse(response, successSchema(notificationItemSchema))).data;
}
export async function createNotification(payload: CreateNotificationPayload): Promise<NotificationItem> {
  const response = await fetch("/api/admin/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  return (await parseApiResponse(response, successSchema(notificationItemSchema))).data;
}
export async function updateNotification(id: string, payload: NotificationWritePayload): Promise<NotificationItem> {
  const response = await fetch(`/api/admin/notifications/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  return (await parseApiResponse(response, successSchema(notificationItemSchema))).data;
}
