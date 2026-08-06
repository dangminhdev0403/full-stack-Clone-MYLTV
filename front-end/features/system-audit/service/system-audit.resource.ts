import { createResource, defineQuery } from "@dangminhdev04032005/query-resource";
import { listAuditLogs, type ListAuditLogsQuery } from "./system-audit.client";

export const systemAuditResource = createResource<void>()({
  namespace: ["clone-myltv"],
  name: "system-audit",
  scopeKey: () => ["admin"],
  queries: {
    list: defineQuery({
      inputKey: (query: ListAuditLogsQuery = {}) => [query.page ?? 1, query.limit ?? 20, query.actor_id ?? "", query.action ?? "", query.bounded_context ?? "", query.resource_type ?? "", query.resource_id ?? "", query.from ?? "", query.to ?? ""],
      queryFn: ({ input }) => listAuditLogs(input),
    }),
  },
  mutations: {},
});
