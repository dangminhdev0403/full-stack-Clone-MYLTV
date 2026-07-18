import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AcademicContextController } from './academic-context/academic-context.controller';
import { AcademicContextService } from './academic-context/academic-context.service';
import { AcademicContextSeedService } from './bootstrap/academic-context-seed.service';
import { IdentityAccessModule } from '../identity-access/identity-access.module';
import { AttendanceController } from './attendance/attendance.controller';
import { AttendanceService } from './attendance/attendance.service';

@Module({
  imports: [PrismaModule, IdentityAccessModule],
  controllers: [AcademicContextController, AttendanceController],
  providers: [
    AcademicContextService,
    AcademicContextSeedService,
    AttendanceService,
  ],
  exports: [AcademicContextService, AttendanceService],
})
export class AcademicsModule {}
