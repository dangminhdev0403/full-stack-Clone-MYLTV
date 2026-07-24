import {
  createResource,
  defineMutation,
  defineQuery,
} from "@dangminhdev04032005/query-resource";
import {
  createTuitionCharge,
  getTuitionCharge,
  listTuitionCharges,
  updateTuitionCharge,
  type TuitionUpdate,
  type TuitionWrite,
} from "./tuition.client";

export const tuitionResource = createResource<void>()({
  namespace: ["clone-myltv"],
  name: "tuition",
  scopeKey: () => ["admin"],
  queries: {
    list: defineQuery({
      inputKey: (query?: string) => [query ?? ""],
      queryFn: ({ input }) => listTuitionCharges(input),
    }),
    detail: defineQuery({
      inputKey: (id: string) => [id],
      queryFn: ({ input }) => getTuitionCharge(input),
    }),
  },
  mutations: {
    create: defineMutation({
      mutationFn: ({ variables }: { variables: TuitionWrite }) =>
        createTuitionCharge(variables),
      invalidates: [{ type: "query", operation: "list" }],
    }),
    update: defineMutation({
      mutationFn: ({
        variables,
      }: {
        variables: { id: string; payload: TuitionUpdate };
      }) => updateTuitionCharge(variables.id, variables.payload),
      invalidates: [
        { type: "query", operation: "list" },
        { type: "query", operation: "detail" },
      ],
    }),
  },
});
