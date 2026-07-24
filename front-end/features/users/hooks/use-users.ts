import { useMutation, useQuery } from "@tanstack/react-query";
import { userResource } from "../service/users.resource";

const users = userResource.bind();

export function useUsersQuery(query = "") {
  return useQuery(users.queries.list.options(query));
}

export function useUserDetailQuery(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    ...users.queries.detail.options(id),
    enabled: options?.enabled ?? Boolean(id),
  });
}

export function useCreateUserMutation() {
  return useMutation(users.mutations.create.options());
}

export function useUpdateUserMutation() {
  return useMutation(users.mutations.update.options());
}

export function useDisableUserMutation() {
  return useMutation(users.mutations.disable.options());
}

export function useResetPasswordMutation() {
  return useMutation(users.mutations.resetPassword.options());
}
