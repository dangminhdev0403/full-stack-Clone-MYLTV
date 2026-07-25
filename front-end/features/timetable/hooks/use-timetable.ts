import { useMutation, useQuery } from "@tanstack/react-query";
import { timetableResource } from "../service/timetable.resource";

const timetable = timetableResource.bind();

export function useTimetableQuery(studentId: string, options?: { enabled?: boolean }) {
  return useQuery({
    ...timetable.queries.get.options(studentId),
    enabled: options?.enabled ?? Boolean(studentId),
  });
}

export function useSaveTimetableMutation() {
  return useMutation(timetable.mutations.save.options());
}
