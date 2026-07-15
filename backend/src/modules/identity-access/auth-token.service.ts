import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { AuthConfigService } from './config/auth-config.service';

export type AccessTokenSubject = {
  id: string;
  username: string;
  role: AuthenticatedUser['role'];
  activeStudentId?: string | null;
};

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authConfig: AuthConfigService,
  ) {}

  issueAccessToken(subject: AccessTokenSubject): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: subject.id,
        username: subject.username,
        role: subject.role,
        active_student_id: subject.activeStudentId ?? null,
      },
      {
        secret: this.authConfig.jwtSecret,
        expiresIn: this.authConfig.jwtExpiresInSeconds,
      },
    );
  }
}
