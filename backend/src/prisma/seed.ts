import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { seedIdentityAccess } from '../modules/identity-access/bootstrap/seed-identity-access';
import { createPrismaClientOptions } from './prisma-client-options';

async function main() {
  const username = process.env.BOOTSTRAP_ADMIN_USERNAME ?? 'admin';
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!password) {
    throw new Error('BOOTSTRAP_ADMIN_PASSWORD is required');
  }

  const prisma = new PrismaClient(createPrismaClientOptions());

  try {
    await seedIdentityAccess(prisma, { username, password });
    console.log('Identity & Access seed completed');
  } finally {
    await prisma.$disconnect();
  }
}

void main();
