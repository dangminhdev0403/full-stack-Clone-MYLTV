import { busRouteResponseSchema, parseApiResponse, successSchema } from "@/lib/api/schemas";

export async function getStudentBusRoute(studentId: string) {
  const response = await fetch(`/api/admin/students/${encodeURIComponent(studentId)}/bus-route`, { cache: "no-store" });
  return (await parseApiResponse(response, successSchema(busRouteResponseSchema))).data;
}