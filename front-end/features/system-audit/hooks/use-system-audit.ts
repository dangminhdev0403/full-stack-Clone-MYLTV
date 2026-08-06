import { useQuery } from "@tanstack/react-query";
import { systemAuditResource } from "../service/system-audit.resource";
import type { ListAuditLogsQuery } from "../service/system-audit.client";

const boundResource = systemAuditResource.bind();

export function useAuditLogsQuery(query?: ListAuditLogsQuery, options?: { enabled?: boolean }) {
  return useQuery({
    ...boundResource.queries.list.options(query),
    enabled: options?.enabled ?? true,
  });
}
