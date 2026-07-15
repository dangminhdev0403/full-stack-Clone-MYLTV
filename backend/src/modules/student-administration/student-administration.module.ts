import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { IdentityAccessModule } from '../identity-access/identity-access.module';
import { StudentAdministrationController } from './student-administration.controller';
import { StudentAdministrationService } from './student-administration.service';
import { StudentContextController } from './student-context.controller';
import { StudentContextService } from './student-context.service';

@Module({
  imports: [PrismaModule, IdentityAccessModule],
  controllers: [StudentAdministrationController, StudentContextController],
  providers: [StudentAdministrationService, StudentContextService],
  exports: [StudentAdministrationService, StudentContextService],
})
export class StudentAdministrationModule {}
