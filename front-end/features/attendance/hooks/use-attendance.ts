import { useMutation, useQuery } from "@tanstack/react-query";
import { attendanceResource } from "../service/attendance.resource";

const attendance = attendanceResource.bind();

export function useAttendanceQuery(query = "") {
  return useQuery(attendance.queries.list.options(query));
}

export function useCreateAttendanceMutation() {
  return useMutation(attendance.mutations.create.options());
}

export function useUpdateAttendanceMutation() {
  return useMutation(attendance.mutations.update.options());
}
