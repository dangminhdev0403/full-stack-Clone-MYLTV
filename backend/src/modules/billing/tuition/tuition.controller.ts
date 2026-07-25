import {
  Body,
  Controller,
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
  TuitionCreateDto,
  TuitionListQueryDto,
  TuitionUpdateDto,
} from './dto/tuition.dto';
import { TuitionService } from './tuition.service';
import {
  validateTuitionCreate,
  validateTuitionList,
  validateTuitionUpdate,
} from './tuition.validation';

@Controller('api/v1/admin/tuition')
@RequireRole('admin', 'super_admin')
export class TuitionController {
  constructor(private readonly tuition: TuitionService) {}

  @Get()
  @RequirePermission('billing.tuition.read')
  list(@Query() query: TuitionListQueryDto) {
    return this.tuition.listCharges(validateTuitionList(query));
  }

  @Post()
  @RequirePermission('billing.tuition.manage')
  create(
    @Body() payload: Partial<TuitionCreateDto>,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.tuition.createCharge(validateTuitionCreate(payload), actor);
  }

  @Get(':id')
  @RequirePermission('billing.tuition.read')
  get(@Param('id') id: string) {
    return this.tuition.getCharge(id);
  }

  @Patch(':id')
  @RequirePermission('billing.tuition.manage')
  update(
    @Param('id') id: string,
    @Body() payload: TuitionUpdateDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.tuition.updateCharge(id, validateTuitionUpdate(payload), actor);
  }
}

import { SkipAuthorization } from '../../../common/auth/skip-authorization.decorator';

@SkipAuthorization()
@Controller('api/v1/home/tuition')
export class AppTuitionSummaryController {
  constructor(private readonly tuition: TuitionService) {}

  @Get('summary')
  getSummary(@CurrentUser() actor: AuthenticatedUser | undefined) {
    return this.tuition.getTuitionSummary(actor?.activeStudentId ?? undefined);
  }
}

@SkipAuthorization()
@Controller('api/v1/services/tuition')
export class AppTuitionServicesController {
  constructor(private readonly tuition: TuitionService) {}

  @Get()
  getServicesTuition(@CurrentUser() actor: AuthenticatedUser | undefined) {
    return this.tuition.getStudentTuition(actor?.activeStudentId ?? undefined);
  }
}
