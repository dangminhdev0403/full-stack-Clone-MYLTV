import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ok } from '../common/api-response';
import { ServicesService } from './services.service';

@Controller('api/v1/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('meals')
  async meals(@Query() query: Record<string, unknown>) {
    return ok(await this.servicesService.meals(query));
  }

  @Post('meals/register')
  async registerMeals(
    @Body()
    body: {
      student_id: string;
      dates: string[];
      action: 'register' | 'cancel';
    },
  ) {
    return ok(await this.servicesService.registerMeals(body));
  }

  @Get('coin-fund')
  async coinFund(@Query() query: Record<string, unknown>) {
    return ok(await this.servicesService.coinFund(query));
  }

  @Get('events')
  async events(@Query() query: Record<string, unknown>) {
    return ok(await this.servicesService.events(query));
  }

  @Post('events/:eventId/register')
  async registerEvent(
    @Param('eventId') eventId: string,
    @Body() body: { student_id: string; note?: string | null },
  ) {
    return ok(await this.servicesService.registerEvent(eventId, body));
  }

  @Get('surveys')
  async surveys(@Query() query: Record<string, unknown>) {
    return ok(await this.servicesService.surveys(query));
  }

  @Post('surveys/:surveyId/submit')
  async submitSurvey(
    @Param('surveyId') surveyId: string,
    @Body() body: { student_id: string; answers: unknown[] },
  ) {
    return ok(await this.servicesService.submitSurvey(surveyId, body));
  }

  @Get('clubs')
  async clubs(@Query() query: Record<string, unknown>) {
    return ok(await this.servicesService.clubs(query));
  }

  @Post('clubs/:clubId/register')
  async registerClub(
    @Param('clubId') clubId: string,
    @Body() body: { student_id: string; note?: string | null },
  ) {
    return ok(await this.servicesService.registerClub(clubId, body));
  }

  @Get('bus-tracking')
  async busTracking(@Query() query: Record<string, unknown>) {
    return ok(await this.servicesService.busTracking(query));
  }

  @Get('uniforms')
  async uniforms(@Query() query: Record<string, unknown>) {
    return ok(await this.servicesService.uniforms(query));
  }

  @Post('uniforms/orders')
  async orderUniforms(
    @Body()
    body: {
      student_id: string;
      items: { product_id: string; size: string; quantity: number }[];
      note?: string | null;
    },
  ) {
    return ok(await this.servicesService.orderUniforms(body));
  }

  @Get('tuition')
  async tuition(@Query() query: Record<string, unknown>) {
    return ok(await this.servicesService.tuition(query));
  }

  @Post('tuition/payment-request')
  async paymentRequest(
    @Body()
    body: {
      student_id: string;
      tuition_ids: string[];
      payment_method: string;
    },
  ) {
    return ok(await this.servicesService.paymentRequest(body));
  }
}
