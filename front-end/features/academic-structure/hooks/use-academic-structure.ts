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

export function useGradeLevelsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    ...boundResource.queries.gradeLevels.options(undefined),
    enabled: options?.enabled ?? true,
  });
}

export function useClassesQuery(query?: Parameters<typeof boundResource.queries.classes.options>[0], options?: { enabled?: boolean }) {
  return useQuery({
    ...boundResource.queries.classes.options(query),
    enabled: options?.enabled ?? true,
  });
}

export function useClassRosterQuery(input: { classId: string; isActive?: boolean }, options?: { enabled?: boolean }) {
  return useQuery({
    ...boundResource.queries.classRoster.options(input),
    enabled: options?.enabled && Boolean(input.classId),
  });
}

export function useCreateGradeLevelMutation() {
  return useMutation(boundResource.mutations.createGradeLevel.options());
}

export function useUpdateGradeLevelMutation() {
  return useMutation(boundResource.mutations.updateGradeLevel.options());
}

export function useCreateClassMutation() {
  return useMutation(boundResource.mutations.createClass.options());
}

export function useUpdateClassMutation() {
  return useMutation(boundResource.mutations.updateClass.options());
}

export function useAssignEnrollmentMutation() {
  return useMutation(boundResource.mutations.assignEnrollment.options());
}

export function useDeactivateEnrollmentMutation() {
  return useMutation(boundResource.mutations.deactivateEnrollment.options());
}

export function useTransferStudentsMutation() {
  return useMutation(boundResource.mutations.transfer.options());
}

export function usePromoteCohortMutation() {
  return useMutation(boundResource.mutations.promote.options());
}
