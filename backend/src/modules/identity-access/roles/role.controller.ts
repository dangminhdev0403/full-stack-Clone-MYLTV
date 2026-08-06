import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermission } from '../../../common/auth/require-permission.decorator';
import { RequireRole } from '../../../common/auth/require-role.decorator';
import { RoleService } from './role.service';
import {
  validateAssignAccountRoles,
  validateCreateRole,
  validateListRolesQuery,
  validateReplaceRolePermissions,
  validateUpdateRole,
  validateUpdateRoleStatus,
} from './role.validation';

@Controller('api/v1/admin')
@RequireRole('admin', 'super_admin')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  private getActorId(actor: AuthenticatedUser | undefined): string {
    if (!actor?.id) {
      throw new UnauthorizedException('Authentication required');
    }
    return actor.id;
  }

  @Get('roles')
  @RequirePermission('identity.roles.read')
  listRoles(@Query() query: unknown) {
    const dto = validateListRolesQuery(query);
    return this.roleService.listRoles(dto);
  }

  @Get('roles/:id')
  @RequirePermission('identity.roles.read')
  getRoleById(@Param('id') id: string) {
    return this.roleService.getRoleById(id);
  }

  @Post('roles')
  @RequirePermission('identity.roles.manage')
  createRole(
    @CurrentUser() actor: AuthenticatedUser | undefined,
    @Body() body: unknown,
  ) {
    const dto = validateCreateRole(body);
    const actorId = this.getActorId(actor);
    return this.roleService.createRole(actorId, dto);
  }

  @Patch('roles/:id')
  @RequirePermission('identity.roles.manage')
  updateRole(
    @CurrentUser() actor: AuthenticatedUser | undefined,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const dto = validateUpdateRole(body);
    const actorId = this.getActorId(actor);
    return this.roleService.updateRole(actorId, id, dto);
  }

  @Patch('roles/:id/status')
  @RequirePermission('identity.roles.manage')
  updateRoleStatus(
    @CurrentUser() actor: AuthenticatedUser | undefined,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const dto = validateUpdateRoleStatus(body);
    const actorId = this.getActorId(actor);
    return this.roleService.updateRoleStatus(actorId, id, dto);
  }

  @Put('roles/:id/permissions')
  @RequirePermission('identity.roles.manage')
  replaceRolePermissions(
    @CurrentUser() actor: AuthenticatedUser | undefined,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const dto = validateReplaceRolePermissions(body);
    const actorId = this.getActorId(actor);
    return this.roleService.replaceRolePermissions(actorId, id, dto);
  }

  @Put('accounts/:account_id/roles')
  @RequirePermission('identity.roles.manage')
  assignAccountRoles(
    @CurrentUser() actor: AuthenticatedUser | undefined,
    @Param('account_id') accountId: string,
    @Body() body: unknown,
  ) {
    const dto = validateAssignAccountRoles(body);
    const actorId = this.getActorId(actor);
    return this.roleService.assignAccountRoles(actorId, accountId, dto);
  }
}
