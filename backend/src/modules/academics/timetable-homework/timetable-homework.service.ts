import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export class SubmitHomeworkDto {
  content?: string;
  attachments?: string[];
}

export class SaveTimetableDto {
  student_id: string;
  week_start: string;
  days: any[];
}

export class CreateHomeworkDto {
  student_id: string;
  subject: string;
  title: string;
  content: string;
  teacher: string;
  deadline: string;
}

@Injectable()
export class TimetableHomeworkService {
  constructor(private readonly prisma: PrismaService) {}

  // Timetable
  async getTimetable(studentId: string, weekStart?: string) {
    const start = weekStart ? new Date(weekStart) : new Date('2026-06-22');
    const schedule = await this.prisma.timetableSchedule.findFirst({
      where: { studentId, weekStart: start },
    });

    if (schedule) {
      return {
        week_start: start.toISOString().split('T')[0],
        days: (schedule.daysJson as any[]) || [],
      };
    }

    return {
      week_start: start.toISOString().split('T')[0],
      days: [
        {
          day_code: 'T2',
          date: start.toISOString().split('T')[0],
          lessons: [
            { period: 'Tiet 1', subject: 'Toan hoc', time: '07:00 - 07:45', room: 'Phong 10A1', teacher: 'Nguyen Van Minh', status: 'Hom nay' },
            { period: 'Tiet 2', subject: 'Ngu van', time: '07:55 - 08:40', room: 'Phong 10A1', teacher: 'Tran Thi Hang', status: 'Hom nay' },
          ],
        },
      ],
    };
  }

  async saveTimetable(body: SaveTimetableDto) {
    const weekStart = new Date(body.week_start);
    return this.prisma.timetableSchedule.upsert({
      where: {
        studentId_weekStart: {
          studentId: body.student_id,
          weekStart,
        },
      },
      create: {
        studentId: body.student_id,
        weekStart,
        daysJson: body.days as any,
      },
      update: {
        daysJson: body.days as any,
      },
    });
  }

  // Homeworks
  async getHomeworks(studentId: string, page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { studentId };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.homeworkAssignment.findMany({
        where,
        orderBy: { assignedAt: 'desc' },
        skip,
        take: limit,
        include: { submissions: true },
      }),
      this.prisma.homeworkAssignment.count({ where }),
    ]);

    const completed = items.filter((i) => i.status === 'submitted' || i.submissions.length > 0).length;

    return {
      progress: { completed, total },
      items: items.map((hw) => ({
        id: hw.id,
        subject: hw.subject,
        title: hw.title,
        content: hw.content,
        teacher: hw.teacher,
        assigned_at: hw.assignedAt.toISOString(),
        deadline: hw.deadline.toISOString(),
        status: hw.status,
        submission_url: hw.submissions[0]?.attachmentsJson ? (hw.submissions[0].attachmentsJson as string[])[0] : null,
        submitted_at: hw.submissions[0]?.submittedAt ? hw.submissions[0].submittedAt.toISOString() : null,
      })),
      pagination: { page, limit, total },
    };
  }

  async submitHomework(studentId: string, homeworkId: string, body: SubmitHomeworkDto) {
    const hw = await this.prisma.homeworkAssignment.findUnique({ where: { id: homeworkId } });
    if (!hw) throw new NotFoundException('Khong tim thay bai tap');

    await this.prisma.homeworkSubmission.create({
      data: {
        homeworkId,
        content: body.content,
        attachmentsJson: body.attachments as any,
        status: 'submitted',
      },
    });

    await this.prisma.homeworkAssignment.update({
      where: { id: homeworkId },
      data: { status: 'submitted' },
    });

    return {
      submitted: true,
      submitted_at: new Date().toISOString(),
      status: 'submitted',
    };
  }

  async createHomework(body: CreateHomeworkDto) {
    return this.prisma.homeworkAssignment.create({
      data: {
        studentId: body.student_id,
        subject: body.subject,
        title: body.title,
        content: body.content,
        teacher: body.teacher,
        deadline: new Date(body.deadline),
        status: 'pending',
      },
    });
  }

  // Online Study
  async getOnlineStudy(studentId: string) {
    const items = await this.prisma.onlineStudySession.findMany({
      where: { studentId },
      orderBy: { startAt: 'asc' },
    });

    return {
      items: items.map((o) => ({
        id: o.id,
        title: o.title,
        subject: o.subject,
        teacher: o.teacher,
        start_at: o.startAt.toISOString(),
        end_at: o.endAt.toISOString(),
        meeting_url: o.meetingUrl,
        status: o.status,
      })),
      pagination: { page: 1, limit: 20, total: items.length },
    };
  }
}
