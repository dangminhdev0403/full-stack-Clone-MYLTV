import { hash } from 'bcrypt';
import type { AccountRole, PrismaClient } from '@prisma/client';
import type { PermissionKey } from '../permissions/permission.registry';

const roleSeeds: Array<{
  username: string;
  displayName: string;
  role: AccountRole;
  customPassword?: string;
  permissionKeys: PermissionKey[];
  studentCode?: string;
  relationship?: 'guardian' | 'student';
}> = [
  {
    username: 'uat-super-admin',
    displayName: 'UAT Super Admin',
    role: 'super_admin',
    permissionKeys: [],
  },
  {
    username: 'uat-admin',
    displayName: 'UAT Admin',
    role: 'admin',
    permissionKeys: [
      'identity.me.read',
      'academics.context.read',
      'students.read',
      'billing.tuition.read',
      'billing.tuition.manage',
      'communication.feedback.read',
      'communication.feedback.manage',
    ],
  },
  {
    username: 'uat-teacher',
    displayName: 'UAT Teacher',
    role: 'teacher',
    permissionKeys: ['identity.me.read'],
  },
  {
    username: 'uat-parent',
    displayName: 'UAT Parent',
    role: 'parent',
    permissionKeys: [
      'identity.me.read',
      'identity.accounts.switch',
      'identity.password.change',
      'identity.sessions.revoke',
      'students.read',
      'academics.context.read',
      'academics.attendance.read',
      'billing.tuition.read',
      'communication.news.read',
      'communication.notifications.read',
    ],
    studentCode: 'UAT-HS-001',
    relationship: 'guardian',
  },
  {
    username: 'a123456',
    displayName: 'Phụ huynh a123456',
    role: 'parent',
    customPassword: 'a123456',
    permissionKeys: [
      'identity.me.read',
      'identity.accounts.switch',
      'identity.password.change',
      'identity.sessions.revoke',
      'students.read',
      'academics.context.read',
      'academics.attendance.read',
      'billing.tuition.read',
      'communication.news.read',
      'communication.notifications.read',
    ],
    studentCode: 'UAT-HS-001',
    relationship: 'guardian',
  },
  {
    username: 'uat-student',
    displayName: 'UAT Student',
    role: 'student',
    permissionKeys: [
      'identity.me.read',
      'identity.accounts.switch',
      'identity.password.change',
      'identity.sessions.revoke',
      'students.read',
      'academics.context.read',
      'academics.attendance.read',
      'billing.tuition.read',
      'communication.news.read',
      'communication.notifications.read',
    ],
    studentCode: 'UAT-HS-001',
    relationship: 'student',
  },
];

export async function seedUatAccounts(
  prisma: PrismaClient,
  password: string,
): Promise<void> {
  if (password.length < 12) {
    throw new Error('UAT_ACCOUNT_PASSWORD must contain at least 12 characters');
  }
  const defaultPasswordHash = await hash(password, 12);
  for (const seed of roleSeeds) {
    const passwordHash = seed.customPassword
      ? await hash(seed.customPassword, 12)
      : defaultPasswordHash;
    const permissionKeys =
      seed.role === 'super_admin'
        ? (await prisma.permission.findMany({ select: { key: true } })).map(
            ({ key }) => key,
          )
        : seed.permissionKeys;
    const account = await prisma.$transaction(async (tx) => {
      const persisted = await tx.permission.findMany({
        where: { key: { in: permissionKeys } },
        select: { key: true },
      });
      if (persisted.length !== permissionKeys.length) {
        throw new Error(`Missing permissions for ${seed.username}`);
      }
      const result = await tx.account.upsert({
        where: { username: seed.username },
        update: {
          displayName: seed.displayName,
          role: seed.role,
          isActive: true,
          passwordHash,
        },
        create: {
          username: seed.username,
          displayName: seed.displayName,
          role: seed.role,
          isActive: true,
          passwordHash,
        },
        select: { id: true },
      });
      await tx.accountPermission.deleteMany({
        where: { accountId: result.id },
      });
      if (permissionKeys.length > 0) {
        await tx.accountPermission.createMany({
          data: permissionKeys.map((permissionKey) => ({
            accountId: result.id,
            permissionKey,
          })),
        });
      }
      return result;
    });
    if (seed.studentCode && seed.relationship) {
      const student = await prisma.student.findUnique({
        where: { code: seed.studentCode },
        select: { id: true },
      });
      if (!student) {
        throw new Error(
          `Student ${seed.studentCode} is required for UAT accounts`,
        );
      }
      await prisma.studentAccountLink.upsert({
        where: {
          studentId_accountId_relationship: {
            studentId: student.id,
            accountId: account.id,
            relationship: seed.relationship,
          },
        },
        update: { isActive: true },
        create: {
          studentId: student.id,
          accountId: account.id,
          relationship: seed.relationship,
          isActive: true,
        },
      });
    }
  }
}
