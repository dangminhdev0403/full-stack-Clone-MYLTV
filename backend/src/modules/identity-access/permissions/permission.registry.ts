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
  {
    key: 'academics.context.read',
    label: 'Read academic context',
    description: 'Read the current academic year and semester context.',
    boundedContext: 'Academics',
    risk: 'low',
  },
  {
    key: 'academics.context.manage',
    label: 'Manage academic context',
    description:
      'Create, update, and set current academic years and semesters.',
    boundedContext: 'Academics',
    risk: 'high',
  },
  {
    key: 'academics.structure.read',
    label: 'Read academic structure',
    description: 'Read grade levels, school classes, and roster enrollments.',
    boundedContext: 'Academics',
    risk: 'low',
  },
  {
    key: 'academics.structure.manage',
    label: 'Manage academic structure',
    description:
      'Create and update grade levels, school classes, and student enrollments.',
    boundedContext: 'Academics',
    risk: 'high',
  },
  {
    key: 'academics.attendance.read',
    label: 'Read attendance',
    description:
      'Read class attendance sessions and student attendance records.',
    boundedContext: 'Academics',
    risk: 'medium',
  },
  {
    key: 'academics.attendance.manage',
    label: 'Manage attendance',
    description: 'Create and update class attendance sessions.',
    boundedContext: 'Academics',
    risk: 'high',
  },
  {
    key: 'academics.scores.read',
    label: 'Read student scores',
    description: 'Read student score records and reward discipline history.',
    boundedContext: 'Academics',
    risk: 'medium',
  },
  {
    key: 'academics.scores.manage',
    label: 'Manage student scores',
    description:
      'Create and update student score records and reward discipline history.',
    boundedContext: 'Academics',
    risk: 'high',
  },
  {
    key: 'academics.homework.read',
    label: 'Read homework assignments',
    description: 'Read homework assignments and submission progress.',
    boundedContext: 'Academics',
    risk: 'medium',
  },
  {
    key: 'academics.homework.manage',
    label: 'Manage homework assignments',
    description: 'Create, update, and archive homework assignments.',
    boundedContext: 'Academics',
    risk: 'high',
  },
  {
    key: 'billing.tuition.read',
    label: 'Read tuition charges',
    description: 'Read student tuition charges and outstanding balances.',
    boundedContext: 'Billing',
    risk: 'high',
  },
  {
    key: 'billing.tuition.manage',
    label: 'Manage tuition charges',
    description: 'Create and update student tuition charges.',
    boundedContext: 'Billing',
    risk: 'critical',
  },
  {
    key: 'communication.news.read',
    label: 'Read news',
    description: 'Read published or administrative news views.',
    boundedContext: 'Communication',
    risk: 'low',
  },
  {
    key: 'communication.news.manage',
    label: 'Manage news',
    description: 'Create, edit, hide, pin, reorder, and delete news.',
    boundedContext: 'Communication',
    risk: 'high',
  },
  {
    key: 'communication.news.publish',
    label: 'Publish news',
    description: 'Publish school news to resolved audiences.',
    boundedContext: 'Communication',
    risk: 'critical',
  },
  {
    key: 'communication.feedback.read',
    label: 'Read feedback',
    description: 'Read administrative feedback views.',
    boundedContext: 'Communication',
    risk: 'medium',
  },
  {
    key: 'communication.feedback.manage',
    label: 'Manage feedback',
    description: 'Update feedback workflow status.',
    boundedContext: 'Communication',
    risk: 'high',
  },
  {
    key: 'communication.notifications.read',
    label: 'Read notifications',
    description: 'Read app and administrative notification views.',
    boundedContext: 'Communication',
    risk: 'low',
  },
  {
    key: 'communication.notifications.manage',
    label: 'Manage notifications',
    description: 'Create and update school notifications.',
    boundedContext: 'Communication',
    risk: 'high',
  },
  {
    key: 'academics.timetable.read',
    label: 'Read timetable',
    description: 'Read class and student timetable schedules.',
    boundedContext: 'Academics',
    risk: 'low',
  },
  {
    key: 'academics.timetable.manage',
    label: 'Manage timetable',
    description: 'Create and update class timetable schedules.',
    boundedContext: 'Academics',
    risk: 'high',
  },
  {
    key: 'student_services.bus.read',
    label: 'Read student bus route',
    description: 'Read student bus route and transportation details.',
    boundedContext: 'Student Services',
    risk: 'medium',
  },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]['key'];

export function isPermissionKey(value: string): value is PermissionKey {
  return PERMISSIONS.some((permission) => permission.key === value);
}
