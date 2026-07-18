import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';
import { StudentAudienceService } from './student-audience.service';

describe('StudentAudienceService', () => {
  it('resolves an active student audience profile through the public boundary', async () => {
    const prisma = prismaMock();
    prisma.student.findUnique.mockResolvedValue({
      id: 'student-1',
      grade: '10',
      className: '10A1',
      isActive: true,
    });
    const service = new StudentAudienceService(
      prisma as unknown as PrismaService,
    );

    await expect(service.getAudienceProfile('student-1')).resolves.toEqual({
      studentId: 'student-1',
      grade: '10',
      className: '10A1',
    });
  });

  it('rejects inactive or unknown student audience targets', async () => {
    const prisma = prismaMock();
    prisma.student.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    const service = new StudentAudienceService(
      prisma as unknown as PrismaService,
    );

    await expect(
      service.assertAudienceTargetsExist([
        { type: 'student', value: 'student-1' },
        { type: 'student', value: 'missing' },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects unknown grade and class audience targets', async () => {
    const prisma = prismaMock();
    prisma.student.count.mockResolvedValueOnce(0);
    const service = new StudentAudienceService(
      prisma as unknown as PrismaService,
    );

    await expect(
      service.assertAudienceTargetsExist([
        { type: 'grade', value: '99' },
        { type: 'class', value: '99Z' },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.student.count).toHaveBeenCalledWith({
      where: { grade: '99', isActive: true },
    });
  });
  it('does not let a populated target mask another missing target', async () => {
    const prisma = prismaMock();
    prisma.student.count.mockResolvedValueOnce(10).mockResolvedValueOnce(0);
    const service = new StudentAudienceService(
      prisma as unknown as PrismaService,
    );

    await expect(
      service.assertAudienceTargetsExist([
        { type: 'grade', value: '10' },
        { type: 'grade', value: '99' },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

function prismaMock() {
  return {
    student: {
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  };
}
