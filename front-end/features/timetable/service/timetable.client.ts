import { z } from "zod";
import { parseApiResponse, successSchema } from "@/lib/api/schemas";

export const timetableItemSchema = z.object({
  day_of_week: z.number().int().min(1).max(7),
  period: z.number().int().positive(),
  subject: z.string(),
  teacher: z.string().optional(),
  room: z.string().optional(),
});

export type TimetableItem = z.infer<typeof timetableItemSchema>;
export type TimetableScope = { class_id: string; semester_id: string; week_start: string };
export type SaveTimetablePayload = TimetableScope & { schedules: TimetableItem[] };

const timetableSchema = z.object({
  class_id: z.string(),
  class_name: z.string(),
  semester_id: z.string(),
  week_start: z.string(),
  schedules: z.array(timetableItemSchema),
  assigned_students: z.number(),
});
export type AdminTimetable = z.infer<typeof timetableSchema>;

export async function getAdminTimetable(scope: TimetableScope): Promise<AdminTimetable> {
  const query = new URLSearchParams(scope);
  const response = await fetch(`/api/admin/timetable?${query}`, { cache: "no-store" });
  return (await parseApiResponse(response, successSchema(timetableSchema))).data;
}

export async function saveTimetable(payload: SaveTimetablePayload): Promise<AdminTimetable> {
  const response = await fetch("/api/admin/timetable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(timetableSchema))).data;
}
