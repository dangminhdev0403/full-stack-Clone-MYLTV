import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import type { AuditService } from '../../identity-access/audit/audit.service';
import type { StudentAudienceService } from '../../student-administration/student-audience.service';
import { NewsService } from './news.service';

describe('NewsService', () => {
  it('creates a draft with validated audience and audit persistence', async () => {
    const { service, prisma, audience, audit } = setup();
    prisma.newsItem.create.mockResolvedValue(newsRecord());

    const result = await service.createNews(
      {
        title: 'School update',
        summary: 'Summary',
        content: 'Content',
        category: 'Thong bao',
        audiences: [{ type: 'student', value: 'student-1' }],
      },
      adminActor(),
    );

    expect(audience.assertAudienceTargetsExist).toHaveBeenCalledWith([
      { type: 'student', value: 'student-1' },
    ]);
    expect(prisma.newsItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'draft',
          createdById: 'admin-1',
        }) as object,
      }),
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'communication.news.create' }),
    );
    expect(result.data.status).toBe('draft');
  });

  it('publishes a draft and rejects invalid lifecycle transitions', async () => {
    const { service, prisma } = setup();
    prisma.newsItem.findUnique.mockResolvedValue(newsRecord());
    prisma.newsItem.updateMany.mockResolvedValue({ count: 1 });
    prisma.newsItem.update.mockResolvedValue(
      newsRecord({ status: 'published', publishedAt: new Date() }),
    );

    const result = await service.publishNews('news-1', adminActor());
    expect(result.data.status).toBe('published');

    prisma.newsItem.findUnique.mockResolvedValue(
      newsRecord({ status: 'published' }),
    );
    await expect(
      service.publishNews('news-1', adminActor()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('fails a publish transition when another request changed the draft first', async () => {
    const { service, prisma } = setup();
    prisma.newsItem.findUnique.mockResolvedValue(newsRecord());
    prisma.newsItem.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.publishNews('news-1', adminActor()),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.newsItem.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'news-1', status: 'draft' } }),
    );
  });

  it('filters app reads by active student audience and published status', async () => {
    const { service, prisma, audience } = setup();
    audience.getAudienceProfile.mockResolvedValue({
      studentId: 'student-1',
      grade: '10',
      className: '10A1',
    });
    prisma.newsItem.findMany.mockResolvedValue([
      newsRecord({ status: 'published' }),
    ]);
    prisma.newsItem.count.mockResolvedValue(1);

    await service.listPublishedNews(
      { page: 1, page_size: 20 },
      { ...parentActor(), activeStudentId: 'student-1' },
    );

    expect(prisma.newsItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'published',
          audiences: {
            some: {
              OR: [
                { type: 'all' },
                { type: 'grade', value: '10' },
                { type: 'class', value: '10A1' },
                { type: 'student', value: 'student-1' },
              ],
            },
          },
        }) as object,
      }),
    );
  });

  it('rejects missing active student and non-admin mutations', async () => {
    const { service } = setup();
    await expect(
      service.listPublishedNews({}, parentActor()),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.createNews(
        { title: 'T', summary: 'S', content: 'C', category: 'Tin tuc' },
        parentActor(),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws not found and supports hide, pin, reorder, and delete mutations', async () => {
    const { service, prisma } = setup();
    prisma.newsItem.findUnique.mockResolvedValue(null);
    await expect(service.getAdminNews('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    prisma.newsItem.findUnique.mockResolvedValue(
      newsRecord({ status: 'published' }),
    );
    prisma.newsItem.update.mockResolvedValue(
      newsRecord({ status: 'hidden', isPinned: true, sortOrder: 5 }),
    );
    await service.hideNews('news-1', adminActor());
    await service.pinNews('news-1', { is_pinned: true }, adminActor());
    await service.reorderNews('news-1', { sort_order: 5 }, adminActor());
    prisma.newsItem.findUnique.mockResolvedValue(
      newsRecord({ status: 'hidden' }),
    );
    prisma.newsItem.delete.mockResolvedValue(newsRecord());
    await service.deleteNews('news-1', adminActor());
    expect(prisma.newsItem.delete).toHaveBeenCalledWith({
      where: { id: 'news-1' },
    });
  });
});

function setup() {
  const prisma = {
    newsItem: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };
  const audience = {
    assertAudienceTargetsExist: jest.fn(),
    getAudienceProfile: jest.fn(),
  };
  const audit = { record: jest.fn() };
  return {
    service: new NewsService(
      prisma as never,
      audience as unknown as StudentAudienceService,
      audit as unknown as AuditService,
    ),
    prisma,
    audience,
    audit,
  };
}

function newsRecord(overrides: Record<string, unknown> = {}) {
  const now = new Date('2026-07-16T00:00:00.000Z');
  return {
    id: 'news-1',
    title: 'School update',
    summary: 'Summary',
    content: 'Content',
    imageUrl: null,
    category: 'Thong bao',
    status: 'draft',
    isPinned: false,
    sortOrder: 0,
    publishedAt: null,
    createdById: 'admin-1',
    createdAt: now,
    updatedAt: now,
    audiences: [{ type: 'all', value: null }],
    ...overrides,
  };
}

function adminActor(): AuthenticatedUser {
  return { id: 'admin-1', username: 'admin', role: 'admin' };
}

function parentActor(): AuthenticatedUser {
  return { id: 'parent-1', username: 'parent', role: 'parent' };
}
