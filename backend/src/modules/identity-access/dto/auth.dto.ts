export type LoginRequestDto = {
  username: string;
  password: string;
  device_id?: string | null;
  fcm_token?: string | null;
};

export type RefreshTokenRequestDto = {
  refresh_token: string;
};

export type LogoutRequestDto = {
  device_id?: string | null;
};

export type AccountRole =
  'parent' | 'student' | 'teacher' | 'admin' | 'super_admin';

export type AuthAccountDto = {
  id: string;
  username: string;
  display_name: string;
  role: AccountRole;
  permissions: string[];
};

export type LoginResponseDto = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  account: AuthAccountDto;
};

export type RefreshTokenResponseDto = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export type LogoutResponseDto = {
  logged_out: true;
};
