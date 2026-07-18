import { z } from "zod";
import {
  attendanceSessionSchema,
  parseApiResponse,
  successSchema,
} from "@/lib/api/schemas";

const listSchema = successSchema(
  z.object({
    items: z.array(attendanceSessionSchema),
    page: z.number(),
    page_size: z.number(),
    total: z.number(),
    has_next: z.boolean(),
  }),
);
export type AttendanceSession = z.infer<typeof attendanceSessionSchema>;
export type AttendanceStatus = AttendanceSession["records"][number]["status"];
export type AttendanceWritePayload = {
  date?: string;
  class_name?: string;
  period?: AttendanceSession["period"];
  records: Array<{
    student_id: string;
    status: AttendanceStatus;
    note: string | null;
  }>;
};

export async function listAttendanceSessions(query = "") {
  const response = await fetch(`/api/admin/attendance${query}`, {
    cache: "no-store",
  });
  return (await parseApiResponse(response, listSchema)).data;
}
export async function createAttendanceSession(payload: AttendanceWritePayload) {
  return mutate("/api/admin/attendance", "POST", payload);
}
export async function updateAttendanceSession(
  id: string,
  payload: AttendanceWritePayload,
) {
  return mutate(
    `/api/admin/attendance/${encodeURIComponent(id)}`,
    "PATCH",
    payload,
  );
}
async function mutate(
  path: string,
  method: "POST" | "PATCH",
  payload: AttendanceWritePayload,
) {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (
    await parseApiResponse(response, successSchema(attendanceSessionSchema))
  ).data;
}
