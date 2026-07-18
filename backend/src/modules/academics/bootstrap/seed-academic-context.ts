import type { PrismaClient } from '@prisma/client';

const CURRENT_YEAR_ID = 'academic-year-2025-2026';
const CURRENT_SEMESTER_ID = 'semester-2-2025-2026';

export async function seedAcademicContext(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.semester.updateMany({
      where: { isCurrent: true, NOT: { id: CURRENT_SEMESTER_ID } },
      data: { isCurrent: false },
    });
    await tx.academicYear.updateMany({
      where: { isCurrent: true, NOT: { id: CURRENT_YEAR_ID } },
      data: { isCurrent: false },
    });
    await tx.academicYear.upsert({
      where: { id: CURRENT_YEAR_ID },
      update: {
        code: '2025-2026',
        displayName: 'Năm học 2025-2026',
        startsOn: new Date('2025-08-01T00:00:00.000Z'),
        endsOn: new Date('2026-07-31T00:00:00.000Z'),
        isCurrent: true,
      },
      create: {
        id: CURRENT_YEAR_ID,
        code: '2025-2026',
        displayName: 'Năm học 2025-2026',
        startsOn: new Date('2025-08-01T00:00:00.000Z'),
        endsOn: new Date('2026-07-31T00:00:00.000Z'),
        isCurrent: true,
      },
    });
    await tx.semester.upsert({
      where: { id: CURRENT_SEMESTER_ID },
      update: {
        academicYearId: CURRENT_YEAR_ID,
        code: 'semester-2',
        displayName: 'Học kỳ 2',
        startsOn: new Date('2026-01-01T00:00:00.000Z'),
        endsOn: new Date('2026-07-31T00:00:00.000Z'),
        sortOrder: 2,
        isCurrent: true,
      },
      create: {
        id: CURRENT_SEMESTER_ID,
        academicYearId: CURRENT_YEAR_ID,
        code: 'semester-2',
        displayName: 'Học kỳ 2',
        startsOn: new Date('2026-01-01T00:00:00.000Z'),
        endsOn: new Date('2026-07-31T00:00:00.000Z'),
        sortOrder: 2,
        isCurrent: true,
      },
    });
  });
}
