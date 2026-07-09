import { NotFoundException } from '@nestjs/common';
import { ManagementService } from './management.service';

describe('ManagementService', () => {
  const now = new Date('2026-07-08T08:30:00.000Z');

  function createService(prismaOverrides: Record<string, unknown>) {
    const prisma = {
      $transaction: jest.fn(async (operations: unknown[]) => Promise.all(operations)),
      student: {},
      newsArticle: {},
      notification: {},
      scoreRecord: {},
      event: {},
      ...prismaOverrides,
    } as never;

    return { service: new ManagementService(prisma), prisma: prisma as any };
  }

  it('lists management domain inventory for frontend admin CRUD', () => {
    const { service } = createService({});

    const inventory = service.inventory();

    expect(inventory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ domain: 'students', supports: expect.objectContaining({ list: true, detail: true, create: true, update: true }) }),
        expect.objectContaining({ domain: 'news', androidEndpoints: expect.arrayContaining(['/home/news']) }),
        expect.objectContaining({ domain: 'uniforms', supports: expect.objectContaining({ list: true, detail: true, create: true, update: true }) }),
      ]),
    );
  });

  it('lists students with account count and contract-aligned fields', async () => {
    const { service, prisma } = createService({
      student: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'stu-1', code: 'HS001', fullName: 'Nguyen Van A', avatarUrl: null, grade: '10', className: '10A1', schoolName: 'Luong The Vinh', updatedAt: now, accounts: [{ accountId: 'acc-1' }] },
        ]),
        count: jest.fn().mockResolvedValue(1),
      },
    });

    const result = await service.list('students', { page: 1, limit: 20 });

    expect(prisma.student.findMany).toHaveBeenCalledWith(expect.objectContaining({ include: { accounts: true } }));
    expect(result.items[0]).toEqual(expect.objectContaining({ id: 'stu-1', code: 'HS001', full_name: 'Nguyen Van A', class_name: '10A1', account_count: 1 }));
    expect(result.pagination.total).toBe(1);
  });

  it('creates and updates news using Android contract field names', async () => {
    const { service, prisma } = createService({
      newsArticle: {
        create: jest.fn().mockResolvedValue({ id: 'news-1', title: 'Title', summary: 'Summary', content: 'Body', imageUrl: null, category: 'Tin_tuc', isPinned: false, publishedAt: now, updatedAt: now }),
        update: jest.fn().mockResolvedValue({ id: 'news-1', title: 'Updated', summary: 'Summary', content: 'Body', imageUrl: null, category: 'Thong_bao', isPinned: true, publishedAt: now, updatedAt: now }),
      },
    });

    await expect(service.create('news', { title: 'Title', summary: 'Summary', content: 'Body', category: 'Tin tuc' })).resolves.toEqual(expect.objectContaining({ category: 'Tin tuc' }));
    await expect(service.update('news', 'news-1', { title: 'Updated', category: 'Thong bao', is_pinned: true })).resolves.toEqual(expect.objectContaining({ title: 'Updated', category: 'Thong bao', is_pinned: true }));
    expect(prisma.newsArticle.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ category: 'Tin_tuc' }) }));
    expect(prisma.newsArticle.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'news-1' }, data: expect.objectContaining({ isPinned: true }) }));
  });

  it('creates notification and score records for admin-managed Android domains', async () => {
    const { service, prisma } = createService({
      notification: {
        create: jest.fn().mockResolvedValue({ id: 'n-1', title: 'Notice', sender: 'BGH', content: 'Body', tag: 'Quan trong', sentAt: now, attachments: [], updatedAt: now }),
      },
      scoreRecord: {
        upsert: jest.fn().mockResolvedValue({ id: 's-1', studentId: 'stu-1', subjectId: 'sub-1', schoolYear: '2026-2027', semester: '1', oralScores: [8], fifteenMinuteScores: [9], midtermScore: 8, finalScore: 9, averageScore: 8.5, teacherComment: 'Good', subject: { name: 'Toan hoc' } }),
      },
    });

    await expect(service.create('notifications', { title: 'Notice', sender: 'BGH', content: 'Body', tag: 'Quan trong' })).resolves.toEqual(expect.objectContaining({ title: 'Notice', is_read: false }));
    await expect(service.create('grades', { student_id: 'stu-1', subject_id: 'sub-1', school_year: '2026-2027', semester: '1', oral_scores: [8], fifteen_minute_scores: [9], midterm_score: 8, final_score: 9, average_score: 8.5, teacher_comment: 'Good' })).resolves.toEqual(expect.objectContaining({ student_id: 'stu-1', subject_name: 'Toan hoc' }));
    expect(prisma.scoreRecord.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { studentId_subjectId_schoolYear_semester: { studentId: 'stu-1', subjectId: 'sub-1', schoolYear: '2026-2027', semester: '1' } } }));
  });

  it('throws NotFoundException for unsupported management domains', async () => {
    const { service } = createService({});

    await expect(service.list('unknown', {})).rejects.toBeInstanceOf(NotFoundException);
  });
});
