import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SchoolApiModule } from './school-api/school-api.module';

@Module({
  imports: [PrismaModule, SchoolApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
