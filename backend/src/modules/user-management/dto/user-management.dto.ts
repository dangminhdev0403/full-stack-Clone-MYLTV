import type { AccountRole } from '@prisma/client';
import type { PermissionKey } from '../../identity-access/permissions/permission.registry';

export type UserListQueryDto = {
  q?: string;
  role?: AccountRole;
  is_active?: string | boolean;
  page?: string | number;
  page_size?: string | number;
};

export type UserSummaryDto = {
  id: string;
  username: string;
  display_name: string;
  role: AccountRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UserDetailDto = UserSummaryDto & {
  permission_keys: PermissionKey[];
};

export type UserListResponseDto = {
  items: UserSummaryDto[];
  page: number;
  page_size: number;
  total: number;
};

export type CreateUserRequestDto = {
  username: string;
  display_name: string;
  role: AccountRole;
  password: string;
  permission_keys: string[];
};

export type UpdateUserRequestDto = {
  display_name?: string;
  role?: AccountRole;
  is_active?: boolean;
  permission_keys?: string[];
};

export type DisableUserResponseDto = {
  disabled: true;
};

export type ResetPasswordRequestDto = {
  password: string;
};

export type ResetPasswordResponseDto = {
  reset: true;
};
