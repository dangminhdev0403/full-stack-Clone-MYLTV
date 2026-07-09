import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { ManagementController } from './management.controller';
import { ManagementService } from './management.service';

@Module({
  controllers: [
    AccountController,
    HomeController,
    NotificationsController,
    StudentsController,
    FeedbackController,
    ServicesController,
    ManagementController,
  ],
  providers: [
    AccountService,
    HomeService,
    NotificationsService,
    StudentsService,
    FeedbackService,
    ServicesService,
    ManagementService,
  ],
})
export class SchoolApiModule {}
