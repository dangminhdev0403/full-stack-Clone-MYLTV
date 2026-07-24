import { useMutation, useQuery } from "@tanstack/react-query";
import { studentResource } from "../service/students.resource";

const students = studentResource.bind();

type StudentListResult = Awaited<ReturnType<typeof students.queries.list.options>> extends { queryFn?: (...args: unknown[]) => infer R } ? Awaited<R> : unknown;

export function useStudentsQuery(
  query = "",
  options?: {
    placeholderData?: (prev: StudentListResult | undefined) => StudentListResult | undefined;
  },
) {
  const resourceOptions = students.queries.list.options(query);
  return useQuery({
    ...resourceOptions,
    ...(options?.placeholderData
      ? { placeholderData: options.placeholderData }
      : {}),
  });
}

export function useStudentDetailQuery(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    ...students.queries.detail.options(id),
    enabled: options?.enabled ?? Boolean(id),
  });
}

export function useCreateStudentMutation() {
  return useMutation(students.mutations.create.options());
}

export function useUpdateStudentMutation() {
  return useMutation(students.mutations.update.options());
}

export function useReplaceStudentAccountsMutation() {
  return useMutation(students.mutations.replaceAccounts.options());
}
