import { z } from "zod";
import { parseApiResponse, successSchema } from "@/lib/api/schemas";

const periodSchema = z.object({
  id: z.string(), code: z.string(), display_name: z.string(), starts_on: z.string(), ends_on: z.string(), is_current: z.literal(true),
});
const academicContextSchema = successSchema(z.object({
  academic_year: periodSchema,
  semester: periodSchema.extend({ sort_order: z.number().int().positive() }),
}));

export type AcademicContext = {
  academicYear: { id: string; code: string; displayName: string; startsOn: string; endsOn: string };
  semester: { id: string; code: string; displayName: string; startsOn: string; endsOn: string; sortOrder: number };
};

export async function getCurrentAcademicContext(): Promise<AcademicContext> {
  const response = await fetch("/api/admin/academic-context/current", { cache: "no-store" });
  const { data } = await parseApiResponse(response, academicContextSchema);
  return {
    academicYear: mapPeriod(data.academic_year),
    semester: { ...mapPeriod(data.semester), sortOrder: data.semester.sort_order },
  };
}

function mapPeriod(period: z.infer<typeof periodSchema>) {
  return { id: period.id, code: period.code, displayName: period.display_name, startsOn: period.starts_on, endsOn: period.ends_on };
}