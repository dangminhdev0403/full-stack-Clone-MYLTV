import { useQuery } from "@tanstack/react-query";
import { academicContextResource } from "../service/academic-context.resource";

const academicContext = academicContextResource.bind();

export function useAcademicContextQuery(options?: { enabled?: boolean }) {
  return useQuery({
    ...academicContext.queries.current.options(undefined),
    enabled: options?.enabled ?? true,
  });
}
