import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export class SaveScoreDto {
  student_id: string;
  semester_id?: string;
  school_year?: string;
  semester_code?: string;
  subject_id: string;
  subject_name: string;
  oral_scores?: number[];
  fifteen_min_scores?: number[];
  midterm_score?: number;
  final_score?: number;
  average_score?: number;
  teacher_comment?: string;
}

export class SaveRewardDisciplineDto {
  student_id: string;
  semester_id?: string;
  school_year?: string;
  type: 'reward' | 'discipline';
  title: string;
  content: string;
  date: string;
  issuer?: string;
}

@Injectable()
export class ScoresService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentScores(studentId: string, schoolYear?: string, semester?: string) {
    const records = await this.prisma.studentScoreRecord.findMany({
      where: {
        studentId,
        ...(schoolYear ? { schoolYear } : {}),
        ...(semester ? { semesterCode: semester } : {}),
      },
    });

    return {
      student_id: studentId,
      school_year: schoolYear || '2026-2027',
      semester: semester || '1',
      subjects: records.map((r) => ({
        subject_id: r.subjectId,
        subject_name: r.subjectName,
        oral_scores: (r.oralScoresJson as number[]) || [8, 9],
        fifteen_minute_scores: (r.fifteenMinScoresJson as number[]) || [8.5],
        midterm_score: r.midtermScore ?? 8,
        final_score: r.finalScore ?? 9,
        average_score: r.averageScore ?? 8.6,
        teacher_comment: r.teacherComment,
      })),
    };
  }

  async getRewardDiscipline(studentId: string, schoolYear?: string, semester?: string, type?: string) {
    const records = await this.prisma.rewardDisciplineRecord.findMany({
      where: {
        studentId,
        ...(type ? { type } : {}),
      },
      orderBy: { date: 'desc' },
    });

    return records.map((r) => ({
      id: r.id,
      type: r.type as 'reward' | 'discipline',
      title: r.title,
      content: r.content,
      date: r.date.toISOString().split('T')[0],
      issuer: r.issuer,
    }));
  }

  async saveScoreRecord(body: SaveScoreDto) {
    const record = await this.prisma.studentScoreRecord.upsert({
      where: {
        studentId_semesterId_subjectId: {
          studentId: body.student_id,
          semesterId: body.semester_id || 'sem-1',
          subjectId: body.subject_id,
        },
      },
      create: {
        studentId: body.student_id,
        semesterId: body.semester_id || 'sem-1',
        schoolYear: body.school_year || '2026-2027',
        semesterCode: body.semester_code || '1',
        subjectId: body.subject_id,
        subjectName: body.subject_name,
        oralScoresJson: (body.oral_scores || []) as any,
        fifteenMinScoresJson: (body.fifteen_min_scores || []) as any,
        midtermScore: body.midterm_score,
        finalScore: body.final_score,
        averageScore: body.average_score,
        teacherComment: body.teacher_comment,
      },
      update: {
        subjectName: body.subject_name,
        oralScoresJson: (body.oral_scores || []) as any,
        fifteenMinScoresJson: (body.fifteen_min_scores || []) as any,
        midtermScore: body.midterm_score,
        finalScore: body.final_score,
        averageScore: body.average_score,
        teacherComment: body.teacher_comment,
      },
    });
    return record;
  }

  async saveRewardDisciplineRecord(body: SaveRewardDisciplineDto) {
    const record = await this.prisma.rewardDisciplineRecord.create({
      data: {
        studentId: body.student_id,
        semesterId: body.semester_id,
        schoolYear: body.school_year || '2026-2027',
        type: body.type,
        title: body.title,
        content: body.content,
        date: new Date(body.date),
        issuer: body.issuer,
      },
    });
    return record;
  }
}
