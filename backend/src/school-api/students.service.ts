import { Injectable, NotFoundException } from '@nestjs/common';
import { pagination } from '../common/api-response';
import {
  dateOnly,
  limitFrom,
  optionalString,
  pageFrom,
  skipFrom,
} from '../common/query';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async scores(studentId: string, query: Record<string, unknown>) {
    const schoolYear = optionalString(query.school_year);
    const semester = optionalString(query.semester);
    const records = await this.prisma.scoreRecord.findMany({
      where: { studentId, schoolYear, semester },
      include: { subject: true },
      orderBy: { subject: { name: 'asc' } },
    });

    return {
      student_id: studentId,
      school_year: schoolYear ?? records[0]?.schoolYear ?? '',
      semester: semester ?? records[0]?.semester ?? '',
      subjects: records.map((record) => ({
        subject_id: record.subjectId,
        subject_name: record.subject.name,
        oral_scores: record.oralScores,
        fifteen_minute_scores: record.fifteenMinuteScores,
        midterm_score: record.midtermScore,
        final_score: record.finalScore,
        average_score: record.averageScore,
        teacher_comment: record.teacherComment,
      })),
    };
  }

  async rewardDiscipline(studentId: string, query: Record<string, unknown>) {
    const rows = await this.prisma.rewardDiscipline.findMany({
      where: {
        studentId,
        schoolYear: optionalString(query.school_year),
        semester: optionalString(query.semester),
        type: optionalString(query.type),
      },
      orderBy: { date: 'desc' },
    });

    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      content: row.content,
      date: dateOnly(row.date),
      issuer: row.issuer,
    }));
  }

  async timetable(studentId: string, query: Record<string, unknown>) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const weekStartText = optionalString(query.week_start);
    const weekStart = weekStartText
      ? new Date(`${weekStartText}T00:00:00.000Z`)
      : undefined;
    const lessons = await this.prisma.timetableLesson.findMany({
      where: {
        className: student.className,
        weekStart,
        dayCode: optionalString(query.day),
      },
      include: { subject: true },
      orderBy: [{ date: 'asc' }, { period: 'asc' }],
    });
    const grouped = new Map<
      string,
      { day_code: string; date: string; lessons: unknown[] }
    >();
    for (const lesson of lessons) {
      const key = `${lesson.dayCode}:${dateOnly(lesson.date)}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          day_code: lesson.dayCode,
          date: dateOnly(lesson.date),
          lessons: [],
        });
      }
      grouped.get(key)?.lessons.push({
        period: lesson.period,
        subject: lesson.subject.name,
        time: lesson.time,
        room: lesson.room,
        teacher: lesson.teacher,
        status: lesson.status,
      });
    }

    return {
      week_start:
        weekStartText ?? (lessons[0] ? dateOnly(lessons[0].weekStart) : ''),
      days: Array.from(grouped.values()),
    };
  }

  async onlineStudy(_studentId: string, query: Record<string, unknown>) {
    const page = pageFrom(query.page);
    const limit = limitFrom(query.limit);
    const subjectId = optionalString(query.subject_id);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.onlineStudy.findMany({
        where: { subjectId },
        include: { subject: true },
        orderBy: { startAt: 'asc' },
        skip: skipFrom(page, limit),
        take: limit,
      }),
      this.prisma.onlineStudy.count({ where: { subjectId } }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        subject: item.subject.name,
        teacher: item.teacher,
        start_at: item.startAt.toISOString(),
        end_at: item.endAt.toISOString(),
        meeting_url: item.meetingUrl,
        status: item.status,
      })),
      pagination: pagination(page, limit, total),
    };
  }

  async busRoute(studentId: string) {
    const assignment = await this.prisma.busAssignment.findUnique({
      where: { studentId },
      include: { route: true },
    });

    return {
      route_id: assignment?.routeId ?? null,
      route_name: assignment?.route.name ?? null,
      pickup_point: assignment?.pickupPoint ?? null,
      dropoff_point: assignment?.dropoffPoint ?? null,
      pickup_time: assignment?.pickupTime ?? null,
      dropoff_time: assignment?.dropoffTime ?? null,
      driver_name: assignment?.route.driverName ?? null,
      driver_phone: assignment?.route.driverPhone ?? null,
      bus_plate: assignment?.route.busPlate ?? null,
    };
  }

  async attendance(studentId: string, query: Record<string, unknown>) {
    const rows = await this.prisma.attendanceRecord.findMany({
      where: {
        studentId,
        status: optionalString(query.status) as never,
      },
      orderBy: { date: 'desc' },
    });
    const presentDays = rows.filter((row) => row.status === 'present').length;
    const lateDays = rows.filter((row) => row.status === 'late').length;
    const excusedAbsentDays = rows.filter(
      (row) => row.status === 'excused',
    ).length;
    const unexcusedAbsentDays = rows.filter(
      (row) => row.status === 'absent',
    ).length;

    return {
      summary: {
        present_days: presentDays,
        late_days: lateDays,
        excused_absent_days: excusedAbsentDays,
        unexcused_absent_days: unexcusedAbsentDays,
      },
      items: rows.map((row) => ({
        date: dateOnly(row.date),
        day_name: row.dayName,
        status: row.status,
        morning_check_in: row.morningCheckIn,
        afternoon_check_in: row.afternoonCheckIn,
        leave_time: row.leaveTime,
        note: row.note,
        confirmed_by_parent: row.confirmedByParent,
      })),
    };
  }

  async homeworks(studentId: string, query: Record<string, unknown>) {
    const page = pageFrom(query.page);
    const limit = limitFrom(query.limit);
    const where = {
      studentId,
      subjectId: optionalString(query.subject_id),
      status: optionalString(query.status) as never,
    };
    const [items, total, completed] = await this.prisma.$transaction([
      this.prisma.homework.findMany({
        where,
        include: { subject: true, submissions: { where: { studentId } } },
        orderBy: { deadline: 'asc' },
        skip: skipFrom(page, limit),
        take: limit,
      }),
      this.prisma.homework.count({ where }),
      this.prisma.homework.count({ where: { studentId, status: 'submitted' } }),
    ]);

    return {
      progress: { completed, total },
      items: items.map((item) => ({
        id: item.id,
        subject: item.subject.name,
        title: item.title,
        content: item.content,
        teacher: item.teacher,
        assigned_at: item.assignedAt.toISOString(),
        deadline: item.deadline.toISOString(),
        status: item.status,
        submission_url: item.submissions[0]?.submissionUrl ?? null,
        submitted_at: item.submissions[0]?.submittedAt.toISOString() ?? null,
      })),
      pagination: pagination(page, limit, total),
    };
  }

  async submitHomework(
    studentId: string,
    homeworkId: string,
    body: { content?: string | null; attachments?: string[] },
  ) {
    const submittedAt = new Date();
    await this.prisma.$transaction([
      this.prisma.homeworkSubmission.create({
        data: {
          studentId,
          homeworkId,
          content: body.content,
          attachments: body.attachments ?? [],
          submittedAt,
        },
      }),
      this.prisma.homework.update({
        where: { id: homeworkId },
        data: { status: 'submitted' },
      }),
    ]);

    return {
      submitted: true,
      submitted_at: submittedAt.toISOString(),
      status: 'submitted',
    };
  }
}
