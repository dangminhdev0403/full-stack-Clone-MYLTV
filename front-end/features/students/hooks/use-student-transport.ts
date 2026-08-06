import { useQuery } from "@tanstack/react-query";
import { studentTransportResource } from "../service/student-transport.resource";

const transport = studentTransportResource.bind();
export function useStudentTransportQuery(studentId: string, enabled = true) {
  return useQuery({ ...transport.queries.detail.options(studentId), enabled: enabled && Boolean(studentId) });
}