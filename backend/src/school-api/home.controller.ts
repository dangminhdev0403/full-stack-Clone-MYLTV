import { Controller, Get, Query } from '@nestjs/common';
import { ok } from '../common/api-response';
import { HomeService } from './home.service';

@Controller('api/v1/home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('news')
  async news(@Query() query: Record<string, unknown>) {
    return ok(await this.homeService.news(query));
  }

  @Get('attendance/today')
  async attendanceToday(@Query() query: Record<string, unknown>) {
    return ok(await this.homeService.attendanceToday(query));
  }

  @Get('tuition/summary')
  async tuitionSummary(@Query() query: Record<string, unknown>) {
    return ok(await this.homeService.tuitionSummary(query));
  }
}
