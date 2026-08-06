import { useMutation, useQuery } from "@tanstack/react-query";
import { academicStructureResource } from "../service/academic-structure.resource";

const boundResource = academicStructureResource.bind();

export function useCurrentAcademicContextQuery(options?: { enabled?: boolean }) {
  return useQuery({
    ...boundResource.queries.current.options(undefined),
    enabled: options?.enabled ?? true,
  });
}

export function useAcademicYearsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    ...boundResource.queries.years.options(undefined),
    enabled: options?.enabled ?? true,
  });
}

export function useSemestersQuery(academicYearId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    ...boundResource.queries.semesters.options(academicYearId),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateAcademicYearMutation() {
  return useMutation(boundResource.mutations.createYear.options());
}

export function useUpdateAcademicYearMutation() {
  return useMutation(boundResource.mutations.updateYear.options());
}

export function useSetAcademicYearCurrentMutation() {
  return useMutation(boundResource.mutations.setYearCurrent.options());
}

export function useCreateSemesterMutation() {
  return useMutation(boundResource.mutations.createSemester.options());
}

export function useUpdateSemesterMutation() {
  return useMutation(boundResource.mutations.updateSemester.options());
}

export function useSetSemesterCurrentMutation() {
  return useMutation(boundResource.mutations.setSemesterCurrent.options());
}
