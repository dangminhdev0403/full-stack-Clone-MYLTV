import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalExceptionFilter } from './common/http/global-exception.filter';
import { HttpLoggerMiddleware } from './common/http/http-logger.middleware';
import { IdentityAccessModule } from './modules/identity-access/identity-access.module';
import { StudentAdministrationModule } from './modules/student-administration/student-administration.module';
import { UserManagementModule } from './modules/user-management/user-management.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { AcademicsModule } from './modules/academics/academics.module';
import { BillingModule } from './modules/billing/billing.module';
import { StudentServicesModule } from './modules/student-services/student-services.module';

@Module({
  imports: [
    IdentityAccessModule,
    StudentAdministrationModule,
    UserManagementModule,
    CommunicationModule,
    AcademicsModule,
    BillingModule,
    StudentServicesModule,
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
