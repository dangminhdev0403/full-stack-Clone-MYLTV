import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { RequireRole } from '../../common/auth/require-role.decorator';
import { SkipAuthorization } from '../../common/auth/skip-authorization.decorator';
import { StudentServicesService } from './student-services.service';

@SkipAuthorization()
@Controller('api/v1')
export class StudentServicesController {
  constructor(private readonly services: StudentServicesService) {}

  // Meals
  @Get('services/meals')
  getMeals(
    @Query('student_id') studentId?: string,
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
  ) {
    return this.services.getMeals(studentId, fromDate, toDate);
  }

  @Post('services/meals/register')
  registerMeals(
    @Body()
    body: {
      student_id: string;
      dates: string[];
      action: 'register' | 'cancel';
    },
  ) {
    return this.services.registerMeals(body);
  }

  // Coin Fund
  @Get('services/coin-fund')
  getCoinFund(@Query('student_id') studentId?: string) {
    return this.services.getCoinFund(studentId);
  }

  // Events
  @Get('services/events')
  getEvents(@Query('student_id') studentId?: string) {
    return this.services.getEvents(studentId);
  }

  @Post('services/events/:id/register')
  registerEvent(
    @Param('id') eventId: string,
    @Body() body: { student_id: string; note?: string },
  ) {
    return this.services.registerEvent(eventId, body);
  }

  // Surveys
  @Get('services/surveys')
  getSurveys(@Query('student_id') studentId?: string) {
    return this.services.getSurveys(studentId);
  }

  @Post('services/surveys/:id/submit')
  submitSurvey(
    @Param('id') surveyId: string,
    @Body() body: { student_id: string; answers: any[] },
  ) {
    return this.services.submitSurvey(surveyId, body);
  }

  // Clubs
  @Get('services/clubs')
  getClubs(@Query('student_id') studentId?: string) {
    return this.services.getClubs(studentId);
  }

  @Post('services/clubs/:id/register')
  registerClub(
    @Param('id') clubId: string,
    @Body() body: { student_id: string; note?: string },
  ) {
    return this.services.registerClub(clubId, body);
  }

  // Bus
  @Get('students/:student_id/bus-route')
  getBusRoute(@Param('student_id') studentId: string) {
    return this.services.getBusRoute(studentId);
  }

  @Get('services/bus-tracking')
  getBusTracking(
    @Query('student_id') studentId?: string,
    @Query('route_id') routeId?: string,
  ) {
    return this.services.getBusTracking(studentId, routeId);
  }

  // Uniforms
  @Get('services/uniforms')
  getUniforms() {
    return this.services.getUniforms();
  }

  @Post('services/uniforms/orders')
  orderUniforms(
    @Body() body: { student_id: string; items: any[]; note?: string },
  ) {
    return this.services.orderUniforms(body);
  }

  // Uploads
  @Post('uploads')
  upload(
    @Body()
    body: {
      file_name?: string;
      mime_type?: string;
      size?: number;
      folder?: string;
    },
  ) {
    return this.services.saveUpload({
      fileName: body.file_name || 'upload.png',
      mimeType: body.mime_type || 'image/png',
      size: body.size || 1024,
      folder: body.folder || 'attachment',
    });
  }

  // Feedback
  @Post('feedback')
  submitFeedback(
    @Body() body: any,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.services.submitFeedback(body, actor?.id);
  }
}

@Controller('api/v1/admin/feedback')
@RequireRole('admin', 'super_admin')
export class AdminFeedbackController {
  constructor(private readonly services: StudentServicesService) {}

  @Get()
  list() {
    return this.services.listAdminFeedback();
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.services.updateAdminFeedbackStatus(id, body.status);
  }
}

@Controller('api/v1/admin/events')
@RequireRole('admin', 'super_admin')
export class AdminEventsController {
  constructor(private readonly services: StudentServicesService) {}

  @Get()
  list(@Query('page') page?: string, @Query('page_size') pageSize?: string) {
    return this.services.listAdminEvents(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @Post()
  create(
    @Body()
    body: {
      title: string;
      description: string;
      start_at: string;
      end_at: string;
      location?: string;
      registration_deadline?: string;
      status?: string;
    },
  ) {
    return this.services.createAdminEvent(body);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.services.getAdminEventDetail(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      start_at?: string;
      end_at?: string;
      location?: string;
      registration_deadline?: string;
      status?: string;
    },
  ) {
    return this.services.updateAdminEvent(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.services.deleteAdminEvent(id);
  }
}
