import { SetMetadata } from '@nestjs/common';
import type { AccountRole } from '@prisma/client';
import { REQUIRED_ROLES_KEY } from './auth.constants';

export const RequireRole = (...roles: AccountRole[]) =>
  SetMetadata(REQUIRED_ROLES_KEY, roles);
