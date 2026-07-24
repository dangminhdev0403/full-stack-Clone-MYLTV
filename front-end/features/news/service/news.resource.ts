import {
  createResource,
  defineMutation,
  defineQuery,
} from "@dangminhdev04032005/query-resource";
import {
  createNews,
  getNews,
  hideNews,
  listNews,
  pinNews,
  publishNews,
  reorderNews,
  updateNews,
  type NewsWritePayload,
} from "./news.client";

export const newsResource = createResource<void>()({
  namespace: ["clone-myltv"],
  name: "news",
  scopeKey: () => ["admin"],
  queries: {
    list: defineQuery({
      inputKey: (query?: string) => [query ?? ""],
      queryFn: ({ input }) => listNews(input),
    }),
    detail: defineQuery({
      inputKey: (id: string) => [id],
      queryFn: ({ input }) => getNews(input),
    }),
  },
  mutations: {
    create: defineMutation({
      mutationFn: ({ variables }: { variables: NewsWritePayload }) =>
        createNews(variables),
      invalidates: [{ type: "query", operation: "list" }],
    }),
    update: defineMutation({
      mutationFn: ({
        variables,
      }: {
        variables: { id: string; payload: NewsWritePayload };
      }) => updateNews(variables.id, variables.payload),
      invalidates: [
        { type: "query", operation: "list" },
        { type: "query", operation: "detail" },
      ],
    }),
    publish: defineMutation({
      mutationFn: ({ variables }: { variables: { id: string } }) =>
        publishNews(variables.id),
      invalidates: [
        { type: "query", operation: "list" },
        { type: "query", operation: "detail" },
      ],
    }),
    hide: defineMutation({
      mutationFn: ({ variables }: { variables: { id: string } }) =>
        hideNews(variables.id),
      invalidates: [
        { type: "query", operation: "list" },
        { type: "query", operation: "detail" },
      ],
    }),
    pin: defineMutation({
      mutationFn: ({
        variables,
      }: {
        variables: { id: string; isPinned: boolean };
      }) => pinNews(variables.id, variables.isPinned),
      invalidates: [
        { type: "query", operation: "list" },
        { type: "query", operation: "detail" },
      ],
    }),
    reorder: defineMutation({
      mutationFn: ({
        variables,
      }: {
        variables: { id: string; sortOrder: number };
      }) => reorderNews(variables.id, variables.sortOrder),
      invalidates: [
        { type: "query", operation: "list" },
        { type: "query", operation: "detail" },
      ],
    }),
  },
});
