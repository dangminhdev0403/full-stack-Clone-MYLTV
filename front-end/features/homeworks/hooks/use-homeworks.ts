import { useMutation, useQuery } from "@tanstack/react-query";
import { homeworksResource } from "../service/homeworks.resource";

const homeworks = homeworksResource.bind();

export function useHomeworksQuery(studentId: string, options?: { enabled?: boolean }) {
  return useQuery({
    ...homeworks.queries.list.options(studentId),
    enabled: options?.enabled ?? Boolean(studentId),
  });
}

export function useCreateHomeworkMutation() {
  return useMutation(homeworks.mutations.create.options());
}
