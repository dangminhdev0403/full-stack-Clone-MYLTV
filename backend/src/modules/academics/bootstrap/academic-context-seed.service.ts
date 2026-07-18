import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { seedAcademicContext } from './seed-academic-context';

@Injectable()
export class AcademicContextSeedService implements OnApplicationBootstrap {
  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    await seedAcademicContext(this.prisma);
  }
}
