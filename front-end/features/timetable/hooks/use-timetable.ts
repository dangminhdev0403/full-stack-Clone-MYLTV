import { useMutation, useQuery } from "@tanstack/react-query";
import { timetableResource } from "../service/timetable.resource";
import type { TimetableScope } from "../service/timetable.client";

const timetable = timetableResource.bind();

export function useAdminTimetableQuery(scope: TimetableScope, options?: { enabled?: boolean }) {
  return useQuery({
    ...timetable.queries.getAdmin.options(scope),
    enabled: options?.enabled ?? Boolean(scope.class_id && scope.semester_id && scope.week_start),
  });
}

export function useSaveTimetableMutation() {
  return useMutation(timetable.mutations.save.options());
}
