import type { AccountRole } from '@prisma/client';
import type { PermissionKey } from '../../modules/identity-access/permissions/permission.registry';

export type AuthenticatedUser = {
  id: string;
  username: string;
  role: AccountRole;
  activeStudentId?: string | null;
  permissions?: PermissionKey[];
};
