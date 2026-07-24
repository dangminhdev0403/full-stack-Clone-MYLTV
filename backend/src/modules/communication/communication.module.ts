import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { IdentityAccessModule } from '../identity-access/identity-access.module';
import { StudentAdministrationModule } from '../student-administration/student-administration.module';
import { AdminNewsController, AppNewsController } from './news/news.controller';
import { NewsService } from './news/news.service';
import { AdminNotificationsController, AppNotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';

@Module({
  imports: [PrismaModule, IdentityAccessModule, StudentAdministrationModule],
  controllers: [AdminNewsController, AppNewsController, AdminNotificationsController, AppNotificationsController],
  providers: [NewsService, NotificationsService],
  exports: [NewsService, NotificationsService],
})
export class CommunicationModule {}

