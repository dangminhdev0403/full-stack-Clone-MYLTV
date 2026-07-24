import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { IdentityAccessModule } from '../identity-access/identity-access.module';
import { AcademicContextController } from './academic-context/academic-context.controller';
import { AcademicContextService } from './academic-context/academic-context.service';
import { AttendanceController } from './attendance/attendance.controller';
import { AttendanceService } from './attendance/attendance.service';
import { AcademicContextSeedService } from './bootstrap/academic-context-seed.service';
import { AdminScoresController, AppScoresController } from './scores/scores.controller';
import { ScoresService } from './scores/scores.service';
import {
  AdminTimetableHomeworkController,
  AppTimetableHomeworkController,
} from './timetable-homework/timetable-homework.controller';
import { TimetableHomeworkService } from './timetable-homework/timetable-homework.service';

@Module({
  imports: [PrismaModule, IdentityAccessModule],
  controllers: [
    AcademicContextController,
    AttendanceController,
    AppScoresController,
    AdminScoresController,
    AppTimetableHomeworkController,
    AdminTimetableHomeworkController,
  ],
  providers: [
    AcademicContextService,
    AcademicContextSeedService,
    AttendanceService,
    ScoresService,
    TimetableHomeworkService,
  ],
  exports: [AcademicContextService, AttendanceService, ScoresService, TimetableHomeworkService],
})
export class AcademicsModule {}
