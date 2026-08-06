import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import { ok } from '../../../common/http/api-response';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../identity-access/audit/audit.service';
import type {
  CreateAcademicYearDto,
  CreateSemesterDto,
  UpdateAcademicYearDto,
  UpdateSemesterDto,
} from './academic-context.validation';

type CurrentSemesterRecord = {
  id: string;
  code: string;
  displayName: string;
  startsOn: Date;
  endsOn: Date;
  sortOrder: number;
  isCurrent: boolean;
};

type CurrentAcademicYearRecord = {
  id: string;
  code: string;
  displayName: string;
  startsOn: Date;
  endsOn: Date;
  isCurrent: boolean;
  semesters: CurrentSemesterRecord[];
};

@Injectable()
export class AcademicContextService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getCurrentContext() {
    const years = (await this.prisma.academicYear.findMany({
      where: { isCurrent: true },
      include: { semesters: { where: { isCurrent: true } } },
      take: 2,
    })) as CurrentAcademicYearRecord[];

    if (years.length !== 1 || years[0].semesters.length !== 1) {
      throw new ServiceUnavailableException(
        'Academic context is not configured coherently',
      );
    }

    const year = years[0];
    const semester = year.semesters[0];
    if (
      year.startsOn > year.endsOn ||
      semester.startsOn > semester.endsOn ||
      semester.startsOn < year.startsOn ||
      semester.endsOn > year.endsOn
    ) {
      throw new ServiceUnavailableException(
        'Academic context is not configured coherently',
      );
    }
    return ok({
      academic_year: {
        id: year.id,
        code: year.code,
        display_name: year.displayName,
        starts_on: this.toDate(year.startsOn),
        ends_on: this.toDate(year.endsOn),
        is_current: year.isCurrent,
      },
      semester: {
        id: semester.id,
        code: semester.code,
        display_name: semester.displayName,
        starts_on: this.toDate(semester.startsOn),
        ends_on: this.toDate(semester.endsOn),
        sort_order: semester.sortOrder,
        is_current: semester.isCurrent,
      },
    });
  }

  async listYears() {
    const years = await this.prisma.academicYear.findMany({
      include: { semesters: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { startsOn: 'desc' },
    });
    return ok({
      academic_years: years.map((y) => this.serializeYear(y)),
    });
  }

  async createYear(dto: CreateAcademicYearDto, actor?: AuthenticatedUser) {
    const existing = await this.prisma.academicYear.findFirst({
      where: {
        OR: [{ id: dto.id }, { code: dto.code }],
      },
    });
    if (existing) {
      throw new ConflictException(
        'Academic year with this ID or code already exists',
      );
    }

    const startsOn = this.parseDate(dto.starts_on);
    const endsOn = this.parseDate(dto.ends_on);

    const year = await this.prisma.$transaction(async (tx) => {
      const created = await tx.academicYear.create({
        data: {
          id: dto.id,
          code: dto.code,
          displayName: dto.display_name,
          startsOn,
          endsOn,
          isCurrent: false,
        },
        include: { semesters: { orderBy: { sortOrder: 'asc' } } },
      });

      await this.audit.record(
        {
          actorId: this.requireActorId(actor),
          action: 'academics.context.year.create',
          boundedContext: 'Academics',
          resourceType: 'AcademicYear',
          resourceId: created.id,
          metadata: { code: created.code, displayName: created.displayName },
        },
        tx,
      );

      return created;
    });

    return ok(this.serializeYear(year));
  }

  async updateYear(
    id: string,
    dto: UpdateAcademicYearDto,
    actor?: AuthenticatedUser,
  ) {
    const existing = await this.prisma.academicYear.findUnique({
      where: { id },
      include: { semesters: true },
    });
    if (!existing) {
      throw new NotFoundException('Academic year not found');
    }

    if (dto.code && dto.code !== existing.code) {
      const codeDuplicate = await this.prisma.academicYear.findUnique({
        where: { code: dto.code },
      });
      if (codeDuplicate) {
        throw new ConflictException('Academic year code already exists');
      }
    }

    const newStartsOn = dto.starts_on
      ? this.parseDate(dto.starts_on)
      : existing.startsOn;
    const newEndsOn = dto.ends_on
      ? this.parseDate(dto.ends_on)
      : existing.endsOn;

    if (newStartsOn > newEndsOn) {
      throw new BadRequestException(
        'starts_on must be before or equal to ends_on',
      );
    }

    for (const semester of existing.semesters) {
      if (semester.startsOn < newStartsOn || semester.endsOn > newEndsOn) {
        throw new BadRequestException(
          'Semester dates must fall within parent academic year',
        );
      }
    }

    const year = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.academicYear.update({
        where: { id },
        data: {
          ...(dto.code ? { code: dto.code } : {}),
          ...(dto.display_name ? { displayName: dto.display_name } : {}),
          ...(dto.starts_on ? { startsOn: newStartsOn } : {}),
          ...(dto.ends_on ? { endsOn: newEndsOn } : {}),
        },
        include: { semesters: { orderBy: { sortOrder: 'asc' } } },
      });

      await this.audit.record(
        {
          actorId: this.requireActorId(actor),
          action: 'academics.context.year.update',
          boundedContext: 'Academics',
          resourceType: 'AcademicYear',
          resourceId: updated.id,
          metadata: { changes: dto },
        },
        tx,
      );

      return updated;
    });

    return ok(this.serializeYear(year));
  }

  async setYearCurrent(id: string, actor?: AuthenticatedUser) {
    const existing = await this.prisma.academicYear.findUnique({
      where: { id },
      include: { semesters: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!existing) {
      throw new NotFoundException('Academic year not found');
    }

    if (existing.semesters.length === 0) {
      throw new BadRequestException(
        'Academic year has no semesters to set as current',
      );
    }

    const currentSemester =
      existing.semesters.find((s) => s.isCurrent) ?? existing.semesters[0];

    const year = await this.prisma.$transaction(async (tx) => {
      await tx.academicYear.updateMany({ data: { isCurrent: false } });
      await tx.semester.updateMany({ data: { isCurrent: false } });

      await tx.academicYear.update({
        where: { id },
        data: { isCurrent: true },
      });

      await tx.semester.update({
        where: { id: currentSemester.id },
        data: { isCurrent: true },
      });

      const updated = await tx.academicYear.findUniqueOrThrow({
        where: { id },
        include: { semesters: { orderBy: { sortOrder: 'asc' } } },
      });

      await this.audit.record(
        {
          actorId: this.requireActorId(actor),
          action: 'academics.context.year.set_current',
          boundedContext: 'Academics',
          resourceType: 'AcademicYear',
          resourceId: updated.id,
          metadata: { currentSemesterId: currentSemester.id },
        },
        tx,
      );

      return updated;
    });

    return ok(this.serializeYear(year));
  }

  async listSemesters(academicYearId?: string) {
    const semesters = await this.prisma.semester.findMany({
      where: academicYearId ? { academicYearId } : {},
      orderBy: [{ academicYearId: 'asc' }, { sortOrder: 'asc' }],
    });
    return ok({
      semesters: semesters.map((s) => this.serializeSemester(s)),
    });
  }

  async createSemester(dto: CreateSemesterDto, actor?: AuthenticatedUser) {
    const existing = await this.prisma.semester.findUnique({
      where: { id: dto.id },
    });
    if (existing) {
      throw new ConflictException('Semester with this ID already exists');
    }

    const parentYear = await this.prisma.academicYear.findUnique({
      where: { id: dto.academic_year_id },
    });
    if (!parentYear) {
      throw new NotFoundException('Parent academic year not found');
    }

    const startsOn = this.parseDate(dto.starts_on);
    const endsOn = this.parseDate(dto.ends_on);

    if (startsOn < parentYear.startsOn || endsOn > parentYear.endsOn) {
      throw new BadRequestException(
        'Semester dates must fall within parent academic year',
      );
    }

    const codeConflict = await this.prisma.semester.findFirst({
      where: {
        academicYearId: dto.academic_year_id,
        code: dto.code,
      },
    });
    if (codeConflict) {
      throw new ConflictException(
        'Semester code must be unique within academic year',
      );
    }

    const sortOrderConflict = await this.prisma.semester.findFirst({
      where: {
        academicYearId: dto.academic_year_id,
        sortOrder: dto.sort_order,
      },
    });
    if (sortOrderConflict) {
      throw new ConflictException(
        'Sort order must be unique within academic year',
      );
    }

    const semester = await this.prisma.$transaction(async (tx) => {
      const created = await tx.semester.create({
        data: {
          id: dto.id,
          academicYearId: dto.academic_year_id,
          code: dto.code,
          displayName: dto.display_name,
          startsOn,
          endsOn,
          sortOrder: dto.sort_order,
          isCurrent: false,
        },
      });

      await this.audit.record(
        {
          actorId: this.requireActorId(actor),
          action: 'academics.context.semester.create',
          boundedContext: 'Academics',
          resourceType: 'Semester',
          resourceId: created.id,
          metadata: {
            academicYearId: created.academicYearId,
            code: created.code,
          },
        },
        tx,
      );

      return created;
    });

    return ok(this.serializeSemester(semester));
  }

  async updateSemester(
    id: string,
    dto: UpdateSemesterDto,
    actor?: AuthenticatedUser,
  ) {
    const existing = await this.prisma.semester.findUnique({
      where: { id },
      include: { academicYear: true },
    });
    if (!existing) {
      throw new NotFoundException('Semester not found');
    }

    const startsOn = dto.starts_on
      ? this.parseDate(dto.starts_on)
      : existing.startsOn;
    const endsOn = dto.ends_on ? this.parseDate(dto.ends_on) : existing.endsOn;

    if (startsOn > endsOn) {
      throw new BadRequestException(
        'starts_on must be before or equal to ends_on',
      );
    }

    if (
      startsOn < existing.academicYear.startsOn ||
      endsOn > existing.academicYear.endsOn
    ) {
      throw new BadRequestException(
        'Semester dates must fall within parent academic year',
      );
    }

    if (dto.code && dto.code !== existing.code) {
      const codeConflict = await this.prisma.semester.findFirst({
        where: { academicYearId: existing.academicYearId, code: dto.code },
      });
      if (codeConflict) {
        throw new ConflictException(
          'Semester code must be unique within academic year',
        );
      }
    }

    if (dto.sort_order && dto.sort_order !== existing.sortOrder) {
      const sortOrderConflict = await this.prisma.semester.findFirst({
        where: {
          academicYearId: existing.academicYearId,
          sortOrder: dto.sort_order,
        },
      });
      if (sortOrderConflict) {
        throw new ConflictException(
          'Sort order must be unique within academic year',
        );
      }
    }

    const semester = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.semester.update({
        where: { id },
        data: {
          ...(dto.code ? { code: dto.code } : {}),
          ...(dto.display_name ? { displayName: dto.display_name } : {}),
          ...(dto.starts_on ? { startsOn } : {}),
          ...(dto.ends_on ? { endsOn } : {}),
          ...(dto.sort_order !== undefined
            ? { sortOrder: dto.sort_order }
            : {}),
        },
      });

      await this.audit.record(
        {
          actorId: this.requireActorId(actor),
          action: 'academics.context.semester.update',
          boundedContext: 'Academics',
          resourceType: 'Semester',
          resourceId: updated.id,
          metadata: { changes: dto },
        },
        tx,
      );

      return updated;
    });

    return ok(this.serializeSemester(semester));
  }

  async setSemesterCurrent(id: string, actor?: AuthenticatedUser) {
    const existing = await this.prisma.semester.findUnique({
      where: { id },
      include: { academicYear: true },
    });
    if (!existing) {
      throw new NotFoundException('Semester not found');
    }

    const semester = await this.prisma.$transaction(async (tx) => {
      await tx.academicYear.updateMany({ data: { isCurrent: false } });
      await tx.semester.updateMany({ data: { isCurrent: false } });

      await tx.academicYear.update({
        where: { id: existing.academicYearId },
        data: { isCurrent: true },
      });

      const updated = await tx.semester.update({
        where: { id },
        data: { isCurrent: true },
      });

      await this.audit.record(
        {
          actorId: this.requireActorId(actor),
          action: 'academics.context.semester.set_current',
          boundedContext: 'Academics',
          resourceType: 'Semester',
          resourceId: updated.id,
          metadata: { academicYearId: updated.academicYearId },
        },
        tx,
      );

      return updated;
    });

    return ok(this.serializeSemester(semester));
  }

  private serializeYear(
    year: Prisma.AcademicYearGetPayload<{
      include: { semesters: true };
    }>,
  ) {
    return {
      id: year.id,
      code: year.code,
      display_name: year.displayName,
      starts_on: this.toDate(year.startsOn),
      ends_on: this.toDate(year.endsOn),
      is_current: year.isCurrent,
      semesters: (year.semesters || []).map((s) => this.serializeSemester(s)),
    };
  }

  private serializeSemester(semester: Prisma.SemesterGetPayload<object>) {
    return {
      id: semester.id,
      academic_year_id: semester.academicYearId,
      code: semester.code,
      display_name: semester.displayName,
      starts_on: this.toDate(semester.startsOn),
      ends_on: this.toDate(semester.endsOn),
      sort_order: semester.sortOrder,
      is_current: semester.isCurrent,
    };
  }

  private requireActorId(actor?: AuthenticatedUser): string {
    if (!actor?.id) throw new UnauthorizedException('Authentication required');
    return actor.id;
  }

  private parseDate(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private toDate(value: Date): string {
    return value.toISOString().slice(0, 10);
  }
}
