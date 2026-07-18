import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type StudentAudienceTarget = {
  type: 'all' | 'grade' | 'class' | 'student';
  value: string | null;
};

export type StudentAudienceProfile = {
  studentId: string;
  grade: string | null;
  className: string;
};

@Injectable()
export class StudentAudienceService {
  constructor(private readonly prisma: PrismaService) {}

  async getAudienceProfile(studentId: string): Promise<StudentAudienceProfile> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId, isActive: true },
      select: { id: true, grade: true, className: true },
    });
    if (!student) {
      throw new NotFoundException('Active student not found');
    }
    return {
      studentId: student.id,
      grade: student.grade,
      className: student.className,
    };
  }

  async assertAudienceTargetsExist(
    targets: StudentAudienceTarget[],
  ): Promise<void> {
    const fields = [
      ['grade', 'grade'],
      ['class', 'className'],
      ['student', 'id'],
    ] as const;

    for (const [type, field] of fields) {
      const values = Array.from(
        new Set(
          targets
            .filter((target) => target.type === type)
            .map((target) => target.value)
            .filter((value): value is string => value !== null),
        ),
      );
      if (values.length === 0) continue;

      for (const value of values) {
        const count = await this.prisma.student.count({
          where: { [field]: value, isActive: true },
        });
        if (count === 0) {
          throw new BadRequestException(
            `One or more ${type} audience targets are invalid`,
          );
        }
      }
    }
  }
}
