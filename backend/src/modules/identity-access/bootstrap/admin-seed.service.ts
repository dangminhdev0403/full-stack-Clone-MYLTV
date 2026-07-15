import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthConfigService } from '../config/auth-config.service';
import { seedIdentityAccess } from './seed-identity-access';

@Injectable()
export class AdminSeedService implements OnApplicationBootstrap {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authConfig: AuthConfigService,
  ) {}

  async onApplicationBootstrap() {
    await seedIdentityAccess(this.prisma, {
      username: this.authConfig.bootstrapAdminUsername,
      password: this.authConfig.bootstrapAdminPassword,
    });
  }
}
