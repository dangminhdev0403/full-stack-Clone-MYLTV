import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import type { AuditService } from '../../identity-access/audit/audit.service';
import { AcademicContextService } from './academic-context.service';

type MockFn = jest.Mock;

interface MockAcademicYearDelegate {
  findMany: MockFn;
  findFirst: MockFn;
  findUnique: MockFn;
  findUniqueOrThrow: MockFn;
  create: MockFn;
  update: MockFn;
  updateMany: MockFn;
}

interface MockSemesterDelegate {
  findMany: MockFn;
  findFirst: MockFn;
  findUnique: MockFn;
  create: MockFn;
  update: MockFn;
  updateMany: MockFn;
}

interface MockPrismaClient {
  academicYear: MockAcademicYearDelegate;
  semester: MockSemesterDelegate;
  $transaction: jest.Mock;
}

interface MockAuditService {
  record: MockFn;
}

describe('AcademicContextService', () => {
  let prisma: MockPrismaClient;
  let audit: MockAuditService;
  let service: AcademicContextService;

  const mockActor: AuthenticatedUser = {
    id: 'admin-1',
    username: 'admin',
    role: 'admin',
  };

  beforeEach(() => {
    prisma = {
      academicYear: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      semester: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((cb: (tx: MockPrismaClient) => unknown) =>
        cb(prisma),
      ),
    };
    audit = {
      record: jest.fn().mockResolvedValue(undefined),
    };
    service = new AcademicContextService(
      prisma as never,
      audit as unknown as AuditService,
    );
  });

  describe('getCurrentContext', () => {
    it('returns the single coherent current academic year and semester', async () => {
      prisma.academicYear.findMany.mockResolvedValue([currentAcademicYear()]);

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
            semesters: [
              currentSemester(),
              currentSemester({ id: 'other-term' }),
            ],
          }),
        ],
      ],
    ])('fails closed for %s', async (_caseName, records) => {
      prisma.academicYear.findMany.mockResolvedValue(records);

      await expect(service.getCurrentContext()).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });

    it('fails closed when the current semester falls outside its academic year', async () => {
      prisma.academicYear.findMany.mockResolvedValue([
        currentAcademicYear({
          semesters: [
            currentSemester({
              startsOn: new Date('2025-07-01T00:00:00.000Z'),
            }),
          ],
        }),
      ]);

      await expect(service.getCurrentContext()).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });
  });

  describe('listYears', () => {
    it('returns all academic years with nested semesters', async () => {
      prisma.academicYear.findMany.mockResolvedValue([currentAcademicYear()]);

      const res = await service.listYears();
      expect(res.success).toBe(true);
      expect(res.data.academic_years).toHaveLength(1);
      expect(res.data.academic_years[0].id).toBe('ay-2025-2026');
      expect(res.data.academic_years[0].semesters).toHaveLength(1);
    });
  });

  describe('createYear', () => {
    it('creates an academic year and records audit log in transaction', async () => {
      prisma.academicYear.findFirst.mockResolvedValue(null);
      prisma.academicYear.create.mockResolvedValue({
        id: 'ay-2026-2027',
        code: '2026-2027',
        displayName: 'Năm học 2026-2027',
        startsOn: new Date('2026-08-01T00:00:00.000Z'),
        endsOn: new Date('2027-07-31T00:00:00.000Z'),
        isCurrent: false,
        semesters: [],
      });

      const res = await service.createYear(
        {
          id: 'ay-2026-2027',
          code: '2026-2027',
          display_name: 'Năm học 2026-2027',
          starts_on: '2026-08-01',
          ends_on: '2027-07-31',
        },
        mockActor,
      );

      expect(res.success).toBe(true);
      expect(res.data.id).toBe('ay-2026-2027');
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: 'admin-1',
          action: 'academics.context.year.create',
          resourceId: 'ay-2026-2027',
        }),
        prisma,
      );
    });

    it('rejects duplicate academic year id or code', async () => {
      prisma.academicYear.findFirst.mockResolvedValue({ id: 'ay-2025-2026' });

      await expect(
        service.createYear(
          {
            id: 'ay-2025-2026',
            code: '2025-2026',
            display_name: 'Dup',
            starts_on: '2025-08-01',
            ends_on: '2026-07-31',
          },
          mockActor,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('updateYear', () => {
    it('updates year and records audit log', async () => {
      const year = currentAcademicYear();
      prisma.academicYear.findUnique.mockResolvedValue(year);
      prisma.academicYear.update.mockResolvedValue({
        ...year,
        displayName: 'Updated Name',
      });

      const res = await service.updateYear(
        'ay-2025-2026',
        { display_name: 'Updated Name' },
        mockActor,
      );

      expect(res.success).toBe(true);
      expect(res.data.display_name).toBe('Updated Name');
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'academics.context.year.update',
          resourceId: 'ay-2025-2026',
        }),
        prisma,
      );
    });

    it('throws NotFoundException if academic year does not exist', async () => {
      prisma.academicYear.findUnique.mockResolvedValue(null);

      await expect(
        service.updateYear('nonexistent', { display_name: 'X' }, mockActor),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException if updated dates invalidate existing semesters', async () => {
      const year = currentAcademicYear({
        semesters: [
          currentSemester({
            startsOn: new Date('2025-08-10T00:00:00.000Z'),
            endsOn: new Date('2026-01-10T00:00:00.000Z'),
          }),
        ],
      });
      prisma.academicYear.findUnique.mockResolvedValue(year);

      await expect(
        service.updateYear(
          'ay-2025-2026',
          { starts_on: '2025-09-01' },
          mockActor,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('setYearCurrent', () => {
    it('transactionally sets current year and picks current semester', async () => {
      const year = currentAcademicYear({ isCurrent: false });
      prisma.academicYear.findUnique.mockResolvedValue(year);
      prisma.academicYear.findUniqueOrThrow.mockResolvedValue({
        ...year,
        isCurrent: true,
      });

      const res = await service.setYearCurrent('ay-2025-2026', mockActor);

      expect(res.success).toBe(true);
      expect(prisma.academicYear.updateMany).toHaveBeenCalledWith({
        data: { isCurrent: false },
      });
      expect(prisma.semester.updateMany).toHaveBeenCalledWith({
        data: { isCurrent: false },
      });
      expect(prisma.academicYear.update).toHaveBeenCalledWith({
        where: { id: 'ay-2025-2026' },
        data: { isCurrent: true },
      });
      expect(prisma.semester.update).toHaveBeenCalledWith({
        where: { id: 'semester-2-2025-2026' },
        data: { isCurrent: true },
      });
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'academics.context.year.set_current',
          resourceId: 'ay-2025-2026',
        }),
        prisma,
      );
    });

    it('throws BadRequestException if year has no semesters', async () => {
      prisma.academicYear.findUnique.mockResolvedValue(
        currentAcademicYear({ semesters: [] }),
      );

      await expect(
        service.setYearCurrent('ay-2025-2026', mockActor),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('listSemesters', () => {
    it('returns list of semesters', async () => {
      prisma.semester.findMany.mockResolvedValue([currentSemester()]);

      const res = await service.listSemesters('ay-2025-2026');
      expect(res.success).toBe(true);
      expect(res.data.semesters).toHaveLength(1);
      expect(res.data.semesters[0].id).toBe('semester-2-2025-2026');
    });
  });

  describe('createSemester', () => {
    it('creates semester and audits transaction', async () => {
      prisma.semester.findUnique.mockResolvedValue(null);
      prisma.academicYear.findUnique.mockResolvedValue(currentAcademicYear());
      prisma.semester.findFirst.mockResolvedValue(null);
      prisma.semester.create.mockResolvedValue({
        id: 'sem-1',
        academicYearId: 'ay-2025-2026',
        code: 'sem-1',
        displayName: 'Học kỳ 1',
        startsOn: new Date('2025-08-01T00:00:00.000Z'),
        endsOn: new Date('2025-12-31T00:00:00.000Z'),
        sortOrder: 1,
        isCurrent: false,
      });

      const res = await service.createSemester(
        {
          id: 'sem-1',
          academic_year_id: 'ay-2025-2026',
          code: 'sem-1',
          display_name: 'Học kỳ 1',
          starts_on: '2025-08-01',
          ends_on: '2025-12-31',
          sort_order: 1,
        },
        mockActor,
      );

      expect(res.success).toBe(true);
      expect(res.data.id).toBe('sem-1');
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'academics.context.semester.create',
          resourceId: 'sem-1',
        }),
        prisma,
      );
    });

    it('rejects semester outside parent academic year dates', async () => {
      prisma.semester.findUnique.mockResolvedValue(null);
      prisma.academicYear.findUnique.mockResolvedValue(currentAcademicYear());

      await expect(
        service.createSemester(
          {
            id: 'sem-invalid',
            academic_year_id: 'ay-2025-2026',
            code: 'sem-invalid',
            display_name: 'Invalid',
            starts_on: '2025-07-01',
            ends_on: '2025-12-31',
            sort_order: 1,
          },
          mockActor,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('updateSemester', () => {
    it('updates semester and audits transaction', async () => {
      const sem = {
        ...currentSemester(),
        academicYear: currentAcademicYear(),
      };
      prisma.semester.findUnique.mockResolvedValue(sem);
      prisma.semester.update.mockResolvedValue({
        ...sem,
        displayName: 'Updated Semester',
      });

      const res = await service.updateSemester(
        'semester-2-2025-2026',
        { display_name: 'Updated Semester' },
        mockActor,
      );

      expect(res.success).toBe(true);
      expect(res.data.display_name).toBe('Updated Semester');
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'academics.context.semester.update',
          resourceId: 'semester-2-2025-2026',
        }),
        prisma,
      );
    });
  });

  describe('setSemesterCurrent', () => {
    it('transactionally sets target semester and parent year as current', async () => {
      const sem = {
        ...currentSemester({ isCurrent: false }),
        academicYear: currentAcademicYear({ isCurrent: false }),
      };
      prisma.semester.findUnique.mockResolvedValue(sem);
      prisma.semester.update.mockResolvedValue({ ...sem, isCurrent: true });

      const res = await service.setSemesterCurrent(
        'semester-2-2025-2026',
        mockActor,
      );

      expect(res.success).toBe(true);
      expect(prisma.academicYear.updateMany).toHaveBeenCalledWith({
        data: { isCurrent: false },
      });
      expect(prisma.semester.updateMany).toHaveBeenCalledWith({
        data: { isCurrent: false },
      });
      expect(prisma.academicYear.update).toHaveBeenCalledWith({
        where: { id: 'ay-2025-2026' },
        data: { isCurrent: true },
      });
      expect(prisma.semester.update).toHaveBeenCalledWith({
        where: { id: 'semester-2-2025-2026' },
        data: { isCurrent: true },
      });
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'academics.context.semester.set_current',
          resourceId: 'semester-2-2025-2026',
        }),
        prisma,
      );
    });
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
    academicYearId: 'ay-2025-2026',
    code: 'semester-2',
    displayName: 'Học kỳ 2',
    startsOn: new Date('2026-01-01T00:00:00.000Z'),
    endsOn: new Date('2026-07-31T00:00:00.000Z'),
    sortOrder: 2,
    isCurrent: true,
    ...overrides,
  };
}
