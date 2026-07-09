import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: {
    student_id?: string | null;
    title: string;
    content: string;
    category: string;
    attachments?: string[];
  }) {
    const row = await this.prisma.feedback.create({
      data: {
        studentId: body.student_id,
        title: body.title,
        content: body.content,
        category: body.category,
        attachments: body.attachments ?? [],
      },
    });

    return {
      id: row.id,
      status: row.status,
      created_at: row.createdAt.toISOString(),
    };
  }
}
