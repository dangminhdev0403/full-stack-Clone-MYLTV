import { z } from "zod";
import {
  parseApiResponse,
  successSchema,
  tuitionChargeSchema,
  tuitionListSchema,
} from "@/lib/api/schemas";

export type TuitionCharge = z.infer<typeof tuitionChargeSchema>;
export type TuitionStatus = TuitionCharge["status"];
export type TuitionWrite = {
  student_id: string;
  semester_id: string;
  title: string;
  amount_due: number;
  amount_paid: number;
  due_date: string | null;
  note: string | null;
  is_waived: boolean;
};
export type TuitionUpdate = Partial<
  Pick<
    TuitionWrite,
    "title" | "amount_due" | "amount_paid" | "due_date" | "note" | "is_waived"
  >
>;

export async function listTuitionCharges(query = "") {
  const response = await fetch(`/api/admin/tuition${query}`, {
    method: "GET",
    cache: "no-store",
  });
  return (await parseApiResponse(response, successSchema(tuitionListSchema)))
    .data;
}
export async function getTuitionCharge(id: string) {
  const response = await fetch(`/api/admin/tuition/${encodeURIComponent(id)}`, {
    method: "GET",
    cache: "no-store",
  });
  return (await parseApiResponse(response, successSchema(tuitionChargeSchema)))
    .data;
}
export async function createTuitionCharge(payload: TuitionWrite) {
  const response = await fetch("/api/admin/tuition", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(tuitionChargeSchema)))
    .data;
}
export async function updateTuitionCharge(id: string, payload: TuitionUpdate) {
  const response = await fetch(`/api/admin/tuition/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await parseApiResponse(response, successSchema(tuitionChargeSchema)))
    .data;
}
