import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalExceptionFilter } from './common/http/global-exception.filter';
import { IdentityAccessModule } from './modules/identity-access/identity-access.module';
import { StudentAdministrationModule } from './modules/student-administration/student-administration.module';
import { UserManagementModule } from './modules/user-management/user-management.module';

@Module({
  imports: [
    IdentityAccessModule,
    StudentAdministrationModule,
    UserManagementModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
