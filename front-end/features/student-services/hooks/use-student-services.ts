import { useQuery } from "@tanstack/react-query";
import { studentServicesResource } from "../service/student-services.resource";

const boundResource = studentServicesResource.bind();

export function useMealsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    ...boundResource.queries.meals.options(undefined),
    enabled: options?.enabled ?? true,
  });
}

export function useBusQuery(options?: { enabled?: boolean }) {
  return useQuery({
    ...boundResource.queries.bus.options(undefined),
    enabled: options?.enabled ?? true,
  });
}

export function useClubsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    ...boundResource.queries.clubs.options(undefined),
    enabled: options?.enabled ?? true,
  });
}

export function useSurveysQuery(options?: { enabled?: boolean }) {
  return useQuery({
    ...boundResource.queries.surveys.options(undefined),
    enabled: options?.enabled ?? true,
  });
}

export function useUniformsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    ...boundResource.queries.uniforms.options(undefined),
    enabled: options?.enabled ?? true,
  });
}
