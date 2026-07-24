import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { IdentityAccessModule } from '../identity-access/identity-access.module';
import {
  AppTuitionServicesController,
  AppTuitionSummaryController,
  TuitionController,
} from './tuition/tuition.controller';
import { TuitionService } from './tuition/tuition.service';

@Module({
  imports: [PrismaModule, IdentityAccessModule],
  controllers: [
    TuitionController,
    AppTuitionSummaryController,
    AppTuitionServicesController,
  ],
  providers: [TuitionService],
  exports: [TuitionService],
})
export class BillingModule {}
