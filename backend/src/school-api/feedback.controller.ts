import { Body, Controller, Post } from '@nestjs/common';
import { ok } from '../common/api-response';
import { FeedbackService } from './feedback.service';

@Controller('api/v1/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async create(
    @Body()
    body: {
      student_id?: string | null;
      title: string;
      content: string;
      category: string;
      attachments?: string[];
    },
  ) {
    return ok(await this.feedbackService.create(body));
  }
}
