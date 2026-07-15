import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { RequirePermission } from '../../common/auth/require-permission.decorator';
import { RequireRole } from '../../common/auth/require-role.decorator';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import type {
  CreateUserRequestDto,
  ResetPasswordRequestDto,
  UpdateUserRequestDto,
  UserListQueryDto,
} from './dto/user-management.dto';
import { UserManagementService } from './user-management.service';
import {
  validateCreateUser,
  validateResetPassword,
  validateUpdateUser,
  validateUserListQuery,
} from './user-management.validation';

@RequireRole('admin', 'super_admin')
@Controller('api/v1/users')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get()
  @RequirePermission('users.manage')
  listUsers(@Query() query: UserListQueryDto) {
    return this.userManagementService.listUsers(validateUserListQuery(query));
  }

  @Get(':id')
  @RequirePermission('users.manage')
  getUser(@Param('id') id: string) {
    return this.userManagementService.getUser(id);
  }

  @Post()
  @RequirePermission('users.manage')
  createUser(
    @Body() payload: CreateUserRequestDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.userManagementService.createUser(
      validateCreateUser(payload),
      actor,
    );
  }

  @Patch(':id')
  @RequirePermission('users.manage')
  updateUser(
    @Param('id') id: string,
    @Body() payload: UpdateUserRequestDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.userManagementService.updateUser(
      id,
      validateUpdateUser(payload),
      actor,
    );
  }

  @Post(':id/disable')
  @RequirePermission('users.manage')
  disableUser(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.userManagementService.disableUser(id, actor);
  }

  @Post(':id/reset-password')
  @RequirePermission('users.manage')
  resetPassword(
    @Param('id') id: string,
    @Body() payload: ResetPasswordRequestDto,
    @CurrentUser() actor: AuthenticatedUser | undefined,
  ) {
    return this.userManagementService.resetPassword(
      id,
      validateResetPassword(payload),
      actor,
    );
  }
}
