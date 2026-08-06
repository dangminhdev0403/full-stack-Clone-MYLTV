import { useMutation, useQuery } from "@tanstack/react-query";
import { attendanceResource } from "../service/attendance.resource";

const attendance = attendanceResource.bind();

export function useAttendanceQuery(query = "") {
  return useQuery(attendance.queries.list.options(query));
}

export function useStudentAttendanceQuery(studentId: string, enabled = true) {
  return useQuery({
    ...attendance.queries.student.options(studentId),
    enabled: enabled && Boolean(studentId),
  });
}

export function useCreateAttendanceMutation() {
  return useMutation(attendance.mutations.create.options());
}

export function useUpdateAttendanceMutation() {
  return useMutation(attendance.mutations.update.options());
}
