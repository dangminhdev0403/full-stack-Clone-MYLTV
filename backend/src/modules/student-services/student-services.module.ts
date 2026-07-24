import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { IdentityAccessModule } from '../identity-access/identity-access.module';

import { AdminFeedbackController, StudentServicesController } from './student-services.controller';
import { StudentServicesService } from './student-services.service';

@Module({
  imports: [PrismaModule, IdentityAccessModule],
  controllers: [StudentServicesController, AdminFeedbackController],
  providers: [StudentServicesService],
  exports: [StudentServicesService],
})
export class StudentServicesModule {}
