import { ServiceUnavailableException } from '@nestjs/common';
import { AcademicContextService } from './academic-context.service';

describe('AcademicContextService', () => {
  it('returns the single coherent current academic year and semester', async () => {
    const prisma = {
      academicYear: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'ay-2025-2026',
            code: '2025-2026',
            displayName: 'Năm học 2025-2026',
            startsOn: new Date('2025-08-01T00:00:00.000Z'),
            endsOn: new Date('2026-07-31T00:00:00.000Z'),
            isCurrent: true,
            semesters: [
              {
                id: 'semester-2-2025-2026',
                code: 'semester-2',
                displayName: 'Học kỳ 2',
                startsOn: new Date('2026-01-01T00:00:00.000Z'),
                endsOn: new Date('2026-07-31T00:00:00.000Z'),
                sortOrder: 2,
                isCurrent: true,
              },
            ],
          },
        ]),
      },
    };
    const service = new AcademicContextService(prisma as never);

    await expect(service.getCurrentContext()).resolves.toEqual({
      success: true,
      data: {
        academic_year: {
          id: 'ay-2025-2026',
          code: '2025-2026',
          display_name: 'Năm học 2025-2026',
          starts_on: '2025-08-01',
          ends_on: '2026-07-31',
          is_current: true,
        },
        semester: {
          id: 'semester-2-2025-2026',
          code: 'semester-2',
          display_name: 'Học kỳ 2',
          starts_on: '2026-01-01',
          ends_on: '2026-07-31',
          sort_order: 2,
          is_current: true,
        },
      },
    });
  });

  it.each([
    ['empty context', []],
    [
      'multiple current years',
      [currentAcademicYear(), currentAcademicYear({ id: 'other-year' })],
    ],
    ['missing current semester', [currentAcademicYear({ semesters: [] })]],
    [
      'multiple current semesters',
      [
        currentAcademicYear({
          semesters: [currentSemester(), currentSemester({ id: 'other-term' })],
        }),
      ],
    ],
  ])('fails closed for %s', async (_caseName, records) => {
    const service = new AcademicContextService({
      academicYear: { findMany: jest.fn().mockResolvedValue(records) },
    } as never);

    await expect(service.getCurrentContext()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('fails closed when the current semester falls outside its academic year', async () => {
    const service = new AcademicContextService({
      academicYear: {
        findMany: jest.fn().mockResolvedValue([
          currentAcademicYear({
            semesters: [
              currentSemester({
                startsOn: new Date('2025-07-01T00:00:00.000Z'),
              }),
            ],
          }),
        ]),
      },
    } as never);

    await expect(service.getCurrentContext()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});

function currentAcademicYear(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ay-2025-2026',
    code: '2025-2026',
    displayName: 'Năm học 2025-2026',
    startsOn: new Date('2025-08-01T00:00:00.000Z'),
    endsOn: new Date('2026-07-31T00:00:00.000Z'),
    isCurrent: true,
    semesters: [currentSemester()],
    ...overrides,
  };
}

function currentSemester(overrides: Record<string, unknown> = {}) {
  return {
    id: 'semester-2-2025-2026',
    code: 'semester-2',
    displayName: 'Học kỳ 2',
    startsOn: new Date('2026-01-01T00:00:00.000Z'),
    endsOn: new Date('2026-07-31T00:00:00.000Z'),
    sortOrder: 2,
    isCurrent: true,
    ...overrides,
  };
}
