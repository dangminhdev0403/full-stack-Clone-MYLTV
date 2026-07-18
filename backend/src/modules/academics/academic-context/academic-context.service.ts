import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ok } from '../../../common/http/api-response';
import { PrismaService } from '../../../prisma/prisma.service';

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
  constructor(private readonly prisma: PrismaService) {}

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

  private toDate(value: Date): string {
    return value.toISOString().slice(0, 10);
  }
}
