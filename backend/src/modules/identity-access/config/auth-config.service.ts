import 'dotenv/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthConfigService {
  get jwtSecret(): string {
    return this.required('JWT_SECRET');
  }

  get jwtExpiresInSeconds(): number {
    return this.number('JWT_EXPIRES_IN_SECONDS', 3600);
  }

  get refreshTokenTtlDays(): number {
    return this.number('REFRESH_TOKEN_TTL_DAYS', 30);
  }

  get bootstrapAdminUsername(): string {
    return process.env.BOOTSTRAP_ADMIN_USERNAME ?? 'admin';
  }

  get bootstrapAdminPassword(): string {
    return this.required('BOOTSTRAP_ADMIN_PASSWORD');
  }

  private required(name: string): string {
    const value = process.env[name];

    if (!value) {
      throw new Error(`${name} is required`);
    }

    return value;
  }

  private number(name: string, fallback: number): number {
    const value = process.env[name];

    if (!value) {
      return fallback;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error(`${name} must be a positive number`);
    }

    return parsed;
  }
}
