import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  NewsAudience,
  NewsAudienceType,
  NewsItem,
  Prisma,
} from '@prisma/client';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import { ok } from '../../../common/http/api-response';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../identity-access/audit/audit.service';
import { StudentAudienceService } from '../../student-administration/student-audience.service';
import type {
  NewsAudienceDto,
  NewsListQueryDto,
  NewsPinRequestDto,
  NewsReorderRequestDto,
  NewsWriteRequestDto,
} from './dto/news.dto';

const newsInclude = { audiences: true } satisfies Prisma.NewsItemInclude;
type NewsRecord = NewsItem & { audiences: NewsAudience[] };

@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly studentAudience: StudentAudienceService,
    private readonly audit: AuditService,
  ) {}

  async listAdminNews(query: NewsListQueryDto) {
    const page = this.page(query.page);
    const pageSize = this.pageSize(query.page_size);
    const where: Prisma.NewsItemWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { summary: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    return this.list(where, page, pageSize);
  }

  async getAdminNews(id: string) {
    return ok(this.toDto(await this.find(id)));
  }

  async createNews(payload: NewsWriteRequestDto, actor?: AuthenticatedUser) {
    const admin = this.requireAdmin(actor);
    const audiences = this.normalizeAudiences(payload.audiences);
    await this.studentAudience.assertAudienceTargetsExist(audiences);
    const news = await this.prisma.newsItem.create({
      data: {
        title: this.required(payload.title, 'title'),
        summary: this.required(payload.summary, 'summary'),
        content: this.required(payload.content, 'content'),
        imageUrl: payload.image_url ?? null,
        category: this.required(payload.category, 'category'),
        status: 'draft',
        createdById: admin.id,
        audiences: { create: audiences },
      },
      include: newsInclude,
    });
    await this.auditMutation(admin.id, 'create', news.id);
    return ok(this.toDto(news));
  }

  async updateNews(
    id: string,
    payload: NewsWriteRequestDto,
    actor?: AuthenticatedUser,
  ) {
    const admin = this.requireAdmin(actor);
    await this.find(id);
    const audiences = payload.audiences
      ? this.normalizeAudiences(payload.audiences)
      : undefined;
    if (audiences)
      await this.studentAudience.assertAudienceTargetsExist(audiences);
    const news = await this.prisma.newsItem.update({
      where: { id },
      data: {
        ...(payload.title !== undefined ? { title: payload.title } : {}),
        ...(payload.summary !== undefined ? { summary: payload.summary } : {}),
        ...(payload.content !== undefined ? { content: payload.content } : {}),
        ...(payload.image_url !== undefined
          ? { imageUrl: payload.image_url }
          : {}),
        ...(payload.category !== undefined
          ? { category: payload.category }
          : {}),
        ...(audiences
          ? { audiences: { deleteMany: {}, create: audiences } }
          : {}),
      },
      include: newsInclude,
    });
    await this.auditMutation(admin.id, 'update', id);
    return ok(this.toDto(news));
  }

  async deleteNews(id: string, actor?: AuthenticatedUser) {
    const admin = this.requireAdmin(actor);
    const current = await this.find(id);
    if (current.status === 'published') {
      throw new BadRequestException(
        'Published news must be hidden before deletion',
      );
    }
    await this.prisma.newsItem.delete({ where: { id } });
    await this.auditMutation(admin.id, 'delete', id);
    return ok({ deleted: true });
  }

  async publishNews(id: string, actor?: AuthenticatedUser) {
    const admin = this.requireAdmin(actor);
    const current = await this.find(id);
    if (current.status !== 'draft') {
      throw new BadRequestException('Only draft news can be published');
    }
    return this.changePublicationState(id, admin.id, 'publish', 'draft', {
      status: 'published',
      publishedAt: new Date(),
    });
  }

  async hideNews(id: string, actor?: AuthenticatedUser) {
    const admin = this.requireAdmin(actor);
    const current = await this.find(id);
    if (current.status !== 'published') {
      throw new BadRequestException('Only published news can be hidden');
    }
    return this.changePublicationState(id, admin.id, 'hide', 'published', {
      status: 'hidden',
    });
  }

  async pinNews(
    id: string,
    payload: NewsPinRequestDto,
    actor?: AuthenticatedUser,
  ) {
    const admin = this.requireAdmin(actor);
    await this.find(id);
    return this.changeState(id, admin.id, 'pin', {
      isPinned: payload.is_pinned,
    });
  }

  async reorderNews(
    id: string,
    payload: NewsReorderRequestDto,
    actor?: AuthenticatedUser,
  ) {
    const admin = this.requireAdmin(actor);
    await this.find(id);
    return this.changeState(id, admin.id, 'reorder', {
      sortOrder: payload.sort_order,
    });
  }

  async listPublishedNews(query: NewsListQueryDto, actor?: AuthenticatedUser) {
    if (!actor?.activeStudentId) {
      throw new ForbiddenException('Active student is required');
    }
    const profile = await this.studentAudience.getAudienceProfile(
      actor.activeStudentId,
    );
    const targets: Prisma.NewsAudienceWhereInput[] = [
      { type: 'all' },
      ...(profile.grade
        ? [{ type: 'grade' as const, value: profile.grade }]
        : []),
      { type: 'class', value: profile.className },
      { type: 'student', value: profile.studentId },
    ];
    const where: Prisma.NewsItemWhereInput = {
      status: 'published',
      publishedAt: { lte: new Date() },
      audiences: { some: { OR: targets } },
    };
    if (query.q) {
      where.AND = [
        {
          OR: [
            { title: { contains: query.q, mode: 'insensitive' } },
            { summary: { contains: query.q, mode: 'insensitive' } },
          ],
        },
      ];
    }
    return this.list(
      where,
      this.page(query.page),
      this.pageSize(query.page_size),
    );
  }

  private async list(
    where: Prisma.NewsItemWhereInput,
    page: number,
    pageSize: number,
  ) {
    const [items, total] = await Promise.all([
      this.prisma.newsItem.findMany({
        where,
        include: newsInclude,
        orderBy: [
          { isPinned: 'desc' },
          { sortOrder: 'asc' },
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.newsItem.count({ where }),
    ]);
    return ok({
      items: items.map((item) => this.toDto(item)),
      page,
      page_size: pageSize,
      total,
      has_next: page * pageSize < total,
    });
  }

  private async changeState(
    id: string,
    actorId: string,
    action: string,
    data: Prisma.NewsItemUpdateInput,
  ) {
    const news = await this.prisma.newsItem.update({
      where: { id },
      data,
      include: newsInclude,
    });
    await this.auditMutation(actorId, action, id);
    return ok(this.toDto(news));
  }

  private async changePublicationState(
    id: string,
    actorId: string,
    action: 'publish' | 'hide',
    expectedStatus: 'draft' | 'published',
    data: Prisma.NewsItemUpdateManyMutationInput,
  ) {
    const transition = await this.prisma.newsItem.updateMany({
      where: { id, status: expectedStatus },
      data,
    });
    if (transition.count !== 1) {
      throw new BadRequestException(
        `News publication state changed; expected ${expectedStatus}`,
      );
    }

    const news = await this.prisma.newsItem.update({
      where: { id },
      data: {},
      include: newsInclude,
    });
    await this.auditMutation(actorId, action, id);
    return ok(this.toDto(news));
  }

  private async find(id: string): Promise<NewsRecord> {
    const news = await this.prisma.newsItem.findUnique({
      where: { id },
      include: newsInclude,
    });
    if (!news) throw new NotFoundException('News item not found');
    return news;
  }

  private normalizeAudiences(audiences?: NewsAudienceDto[]) {
    const source = audiences?.length ? audiences : [{ type: 'all' as const }];
    const unique = new Map<
      string,
      { type: NewsAudienceType; value: string | null }
    >();
    for (const audience of source) {
      const value =
        audience.type === 'all' ? null : (audience.value?.trim() ?? '');
      if (audience.type !== 'all' && !value) {
        throw new BadRequestException('Audience value is required');
      }
      unique.set(`${audience.type}:${value ?? ''}`, {
        type: audience.type,
        value,
      });
    }
    if (unique.has('all:') && unique.size > 1) {
      throw new BadRequestException(
        'All audience cannot be combined with targeted audiences',
      );
    }
    return Array.from(unique.values());
  }

  private requireAdmin(actor?: AuthenticatedUser): AuthenticatedUser {
    if (!actor || (actor.role !== 'admin' && actor.role !== 'super_admin')) {
      throw new ForbiddenException('News mutation requires admin role');
    }
    return actor;
  }

  private required(value: string | undefined, field: string): string {
    if (!value?.trim()) throw new BadRequestException(`${field} is required`);
    return value.trim();
  }

  private page(value?: string | number): number {
    const parsed = Number(value ?? 1);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
  }

  private pageSize(value?: string | number): number {
    return Math.min(this.page(value ?? 20), 100);
  }

  private async auditMutation(
    actorId: string,
    action: string,
    resourceId: string,
  ) {
    await this.audit.record({
      actorId,
      action: `communication.news.${action}`,
      boundedContext: 'Communication',
      resourceType: 'news',
      resourceId,
    });
  }

  private toDto(news: NewsRecord) {
    return {
      id: news.id,
      source: 'SLLĐT',
      author_name: 'Sổ Liên Lạc Điện Tử',
      title: news.title,
      summary: news.summary,
      content: news.content,
      image_url: news.imageUrl,
      category: news.category,
      status: news.status,
      is_pinned: news.isPinned,
      sort_order: news.sortOrder,
      published_at: news.publishedAt?.toISOString() ?? null,
      audiences: news.audiences.map((audience) => ({
        type: audience.type,
        value: audience.value,
      })),
      created_at: news.createdAt.toISOString(),
      updated_at: news.updatedAt.toISOString(),
    };
  }
}
