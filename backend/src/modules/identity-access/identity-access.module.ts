import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthenticationGuard } from '../../common/auth/jwt-authentication.guard';
import { PermissionGuard } from '../../common/auth/permission.guard';
import { PrismaModule } from '../../prisma/prisma.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { AdminSeedService } from './bootstrap/admin-seed.service';
import { AuthConfigService } from './config/auth-config.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { PermissionService } from './permissions/permission.service';

@Module({
  imports: [PrismaModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController, AccountController],
  providers: [
    AuthConfigService,
    AuthTokenService,
    AuthService,
    AccountService,
    PermissionService,
    JwtStrategy,
    AdminSeedService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
  exports: [AuthService, AccountService, AuthTokenService, PermissionService],
})
export class IdentityAccessModule {}
