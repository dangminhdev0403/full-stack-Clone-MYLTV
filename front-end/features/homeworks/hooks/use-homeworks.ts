import { useMutation, useQuery } from "@tanstack/react-query";
import { homeworksResource } from "../service/homeworks.resource";
import type { HomeworkQuery } from "../service/homeworks.client";
const homeworks = homeworksResource.bind();
export function useHomeworksQuery(query: HomeworkQuery = {}) {
  return useQuery(homeworks.queries.list.options(query));
}
export function useCreateHomeworkMutation() {
  return useMutation(homeworks.mutations.create.options());
}
export function useUpdateHomeworkMutation() {
  return useMutation(homeworks.mutations.update.options());
}
export function useArchiveHomeworkMutation() {
  return useMutation(homeworks.mutations.archive.options());
}
