import { z } from "zod";
import { parseApiResponse, successSchema } from "@/lib/api/schemas";

export const newsStatusSchema = z.enum(["draft", "published", "hidden"]);
const newsAudienceSchema = z.object({
  type: z.enum(["all", "grade", "class", "student"]),
  value: z.string().nullable().optional(),
});
export const newsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  content: z.string(),
  image_url: z.string().nullable(),
  category: z.string(),
  is_pinned: z.boolean(),
  sort_order: z.number(),
  published_at: z.string().nullable(),
  status: newsStatusSchema,
  audiences: z.array(newsAudienceSchema),
  created_at: z.string(),
  updated_at: z.string(),
});

const newsListSchema = successSchema(z.object({
  items: z.array(newsItemSchema),
  page: z.number(),
  page_size: z.number(),
  total: z.number(),
  has_next: z.boolean(),
}));

export type NewsItem = z.infer<typeof newsItemSchema>;
export type NewsWritePayload = Partial<Pick<NewsItem, "title" | "summary" | "content" | "image_url" | "category" | "audiences">>;

export async function listNews(query = ""): Promise<z.infer<typeof newsListSchema>["data"]> {
  const response = await fetch(`/api/admin/news${query}`, { cache: "no-store" });
  return (await parseApiResponse(response, newsListSchema)).data;
}

export async function getNews(id: string): Promise<NewsItem> {
  const response = await fetch(`/api/admin/news/${encodeURIComponent(id)}`, { cache: "no-store" });
  return (await parseApiResponse(response, successSchema(newsItemSchema))).data;
}

export async function createNews(payload: NewsWritePayload): Promise<NewsItem> {
  return mutation("/api/admin/news", "POST", payload);
}

export async function updateNews(id: string, payload: NewsWritePayload): Promise<NewsItem> {
  return mutation(`/api/admin/news/${encodeURIComponent(id)}`, "PATCH", payload);
}

export const publishNews = (id: string) => action(id, "publish");
export const hideNews = (id: string) => action(id, "hide");
export const pinNews = (id: string, isPinned: boolean) => action(id, "pin", { is_pinned: isPinned });
export const reorderNews = (id: string, sortOrder: number) => action(id, "reorder", { sort_order: sortOrder });

async function action(id: string, name: "publish" | "hide" | "pin" | "reorder", payload?: unknown): Promise<NewsItem> {
  return mutation(`/api/admin/news/${encodeURIComponent(id)}/${name}`, "POST", payload);
}

export async function deleteNews(id: string): Promise<void> {
  const response = await fetch(`/api/admin/news/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error("Failed to delete news");
  }
}

async function mutation(path: string, method: "POST" | "PATCH", payload?: unknown): Promise<NewsItem> {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(newsItemSchema))).data;
}
