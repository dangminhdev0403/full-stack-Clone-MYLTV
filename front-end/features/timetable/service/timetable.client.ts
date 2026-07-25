import { z } from "zod";
import { parseApiResponse, successSchema } from "@/lib/api/schemas";

export const timetableItemSchema = z.object({
  id: z.string().optional(),
  class_name: z.string(),
  day_of_week: z.string(),
  period: z.number(),
  subject: z.string(),
  teacher: z.string().optional(),
  room: z.string().optional(),
});

export type TimetableItem = z.infer<typeof timetableItemSchema>;
export type SaveTimetablePayload = {
  class_name: string;
  schedules: TimetableItem[];
};

export async function getStudentTimetable(studentId: string): Promise<TimetableItem[]> {
  const response = await fetch(`/api/admin/timetable/${encodeURIComponent(studentId)}`, { cache: "no-store" });
  if (!response.ok) return [];
  const parsed = await parseApiResponse(response, successSchema(z.array(timetableItemSchema)));
  return parsed.data;
}

export async function saveTimetable(payload: SaveTimetablePayload): Promise<TimetableItem[]> {
  const response = await fetch("/api/admin/timetable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(z.array(timetableItemSchema)))).data;
}
