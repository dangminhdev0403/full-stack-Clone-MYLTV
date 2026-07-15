export const PERMISSIONS = [
  {
    key: 'identity.me.read',
    label: 'Read own identity profile',
    description:
      'Read the authenticated actor profile and session bootstrap data.',
    boundedContext: 'Identity & Access',
    risk: 'low',
  },
  {
    key: 'identity.accounts.switch',
    label: 'Switch active account context',
    description:
      'Switch between allowed account/student contexts for the authenticated actor.',
    boundedContext: 'Identity & Access',
    risk: 'medium',
  },
  {
    key: 'identity.password.change',
    label: 'Change own password',
    description:
      'Change the authenticated actor password after validating the current password.',
    boundedContext: 'Identity & Access',
    risk: 'medium',
  },
  {
    key: 'identity.sessions.revoke',
    label: 'Revoke own sessions',
    description:
      'Log out and revoke active refresh sessions for the authenticated actor.',
    boundedContext: 'Identity & Access',
    risk: 'medium',
  },
  {
    key: 'identity.permissions.read',
    label: 'Read permission catalog',
    description: 'Read the platform permission catalog and access model.',
    boundedContext: 'Identity & Access',
    risk: 'high',
  },
  {
    key: 'identity.permissions.manage',
    label: 'Manage permissions',
    description: 'Assign and revoke business permissions.',
    boundedContext: 'Identity & Access',
    risk: 'critical',
  },
  {
    key: 'users.manage',
    label: 'Manage users',
    description:
      'Create, update, disable, and assign access for platform users.',
    boundedContext: 'User Management',
    risk: 'critical',
  },
  {
    key: 'students.read',
    label: 'Read students',
    description: 'Read student profiles and account-student relationships.',
    boundedContext: 'Student Administration',
    risk: 'medium',
  },
  {
    key: 'students.manage',
    label: 'Manage students',
    description: 'Create and update student profiles.',
    boundedContext: 'Student Administration',
    risk: 'high',
  },
  {
    key: 'students.accounts.manage',
    label: 'Manage student account links',
    description: 'Assign and replace guardian account links for students.',
    boundedContext: 'Student Administration',
    risk: 'critical',
  },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]['key'];

export function isPermissionKey(value: string): value is PermissionKey {
  return PERMISSIONS.some((permission) => permission.key === value);
}
