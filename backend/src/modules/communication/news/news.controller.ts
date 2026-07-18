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
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermission } from '../../../common/auth/require-permission.decorator';
import { RequireRole } from '../../../common/auth/require-role.decorator';
import type {
  NewsListQueryDto,
  NewsPinRequestDto,
  NewsReorderRequestDto,
  NewsWriteRequestDto,
} from './dto/news.dto';
import { NewsService } from './news.service';
import {
  validateCreateNews,
  validateNewsList,
  validatePin,
  validateReorder,
  validateUpdateNews,
} from './news.validation';

@Controller('api/v1/admin/news')
@RequireRole('admin', 'super_admin')
export class AdminNewsController {
  constructor(private readonly news: NewsService) {}

  @Get()
  @RequirePermission('communication.news.read')
  list(@Query() query: NewsListQueryDto) {
    return this.news.listAdminNews(validateNewsList(query));
  }

  @Post()
  @RequirePermission('communication.news.manage')
  create(
    @Body() payload: NewsWriteRequestDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.news.createNews(validateCreateNews(payload), actor);
  }

  @Get(':id')
  @RequirePermission('communication.news.read')
  get(@Param('id') id: string) {
    return this.news.getAdminNews(id);
  }

  @Patch(':id')
  @RequirePermission('communication.news.manage')
  update(
    @Param('id') id: string,
    @Body() payload: NewsWriteRequestDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.news.updateNews(id, validateUpdateNews(payload), actor);
  }

  @Delete(':id')
  @RequirePermission('communication.news.manage')
  remove(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.news.deleteNews(id, actor);
  }

  @Post(':id/publish')
  @RequirePermission('communication.news.publish')
  publish(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.news.publishNews(id, actor);
  }

  @Post(':id/hide')
  @RequirePermission('communication.news.publish')
  hide(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.news.hideNews(id, actor);
  }

  @Post(':id/pin')
  @RequirePermission('communication.news.manage')
  pin(
    @Param('id') id: string,
    @Body() payload: NewsPinRequestDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.news.pinNews(id, validatePin(payload), actor);
  }

  @Post(':id/reorder')
  @RequirePermission('communication.news.manage')
  reorder(
    @Param('id') id: string,
    @Body() payload: NewsReorderRequestDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.news.reorderNews(id, validateReorder(payload), actor);
  }
}

@Controller('api/v1/home/news')
export class AppNewsController {
  constructor(private readonly news: NewsService) {}

  @Get()
  @RequirePermission('communication.news.read')
  list(
    @Query() query: NewsListQueryDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.news.listPublishedNews(validateNewsList(query), actor);
  }
}
