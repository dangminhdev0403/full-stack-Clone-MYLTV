import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { IdentityAccessModule } from '../identity-access/identity-access.module';
import { AcademicContextController } from './academic-context/academic-context.controller';
import { AcademicContextService } from './academic-context/academic-context.service';
import { AcademicStructureController } from './academic-structure/academic-structure.controller';
import { AcademicStructureService } from './academic-structure/academic-structure.service';
import {
  AppAttendanceController,
  AttendanceController,
  StudentAttendanceController,
} from './attendance/attendance.controller';
import { AttendanceService } from './attendance/attendance.service';
import { AcademicContextSeedService } from './bootstrap/academic-context-seed.service';
import {
  AdminScoresController,
  AppScoresController,
} from './scores/scores.controller';
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
    AcademicStructureController,
    AttendanceController,
    AppAttendanceController,
    StudentAttendanceController,
    AppScoresController,
    AdminScoresController,
    AppTimetableHomeworkController,
    AdminTimetableHomeworkController,
  ],
  providers: [
    AcademicContextService,
    AcademicStructureService,
    AcademicContextSeedService,
    AttendanceService,
    ScoresService,
    TimetableHomeworkService,
  ],
  exports: [
    AcademicContextService,
    AcademicStructureService,
    AttendanceService,
    ScoresService,
    TimetableHomeworkService,
  ],
})
export class AcademicsModule {}
