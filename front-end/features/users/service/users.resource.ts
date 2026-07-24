import {
  createResource,
  defineMutation,
  defineQuery,
} from "@dangminhdev04032005/query-resource";
import {
  createUser,
  disableUser,
  getUser,
  listUsers,
  resetUserPassword,
  updateUser,
  type UpdateUserPayload,
  type User,
} from "./users.client";

export const userResource = createResource<void>()({
  namespace: ["clone-myltv"],
  name: "users",
  scopeKey: () => ["admin"],
  queries: {
    list: defineQuery({
      inputKey: (query?: string) => [query ?? ""],
      queryFn: ({ input }) => listUsers(input),
    }),
    detail: defineQuery({
      inputKey: (id: string) => [id],
      queryFn: ({ input }) => getUser(input),
    }),
  },
  mutations: {
    create: defineMutation({
      mutationFn: ({
        variables,
      }: {
        variables: {
          username: string;
          display_name: string;
          role: User["role"];
          password: string;
          permission_keys: string[];
        };
      }) => createUser(variables),
      invalidates: [{ type: "query", operation: "list" }],
    }),
    update: defineMutation({
      mutationFn: ({
        variables,
      }: {
        variables: { id: string; payload: UpdateUserPayload };
      }) => updateUser(variables.id, variables.payload),
      invalidates: [
        { type: "query", operation: "list" },
        { type: "query", operation: "detail" },
      ],
    }),
    disable: defineMutation({
      mutationFn: ({ variables }: { variables: { id: string } }) =>
        disableUser(variables.id),
      invalidates: [
        { type: "query", operation: "list" },
        { type: "query", operation: "detail" },
      ],
    }),
    resetPassword: defineMutation({
      mutationFn: ({
        variables,
      }: {
        variables: { id: string; password: string };
      }) => resetUserPassword(variables.id, variables.password),
      invalidates: [
        { type: "query", operation: "list" },
        { type: "query", operation: "detail" },
      ],
    }),
  },
});
