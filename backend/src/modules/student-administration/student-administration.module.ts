import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { IdentityAccessModule } from '../identity-access/identity-access.module';
import { StudentAdministrationController } from './student-administration.controller';
import { StudentAdministrationService } from './student-administration.service';
import { StudentContextController } from './student-context.controller';
import { StudentContextService } from './student-context.service';
import { StudentAudienceService } from './student-audience.service';

@Module({
  imports: [PrismaModule, IdentityAccessModule],
  controllers: [StudentAdministrationController, StudentContextController],
  providers: [
    StudentAdministrationService,
    StudentContextService,
    StudentAudienceService,
  ],
  exports: [
    StudentAdministrationService,
    StudentContextService,
    StudentAudienceService,
  ],
})
export class StudentAdministrationModule {}
