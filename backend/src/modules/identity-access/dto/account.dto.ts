import type { AuthAccountDto } from './auth.dto';

export type CurrentActorResponseDto = {
  account: AuthAccountDto;
  active_student_id: string | null;
};

export type SwitchableAccountDto = {
  account_id: string;
  student_id: string | null;
  student_name: string;
  student_code: string;
  class_name: string;
  grade: string;
  avatar_url: string | null;
  is_active: boolean;
};

export type SwitchAccountRequestDto = {
  account_id: string;
  student_id?: string | null;
};

export type SwitchAccountResponseDto = {
  access_token: string;
  student: {
    id: string;
    full_name: string;
    class_name: string;
  } | null;
};

export type ChangePasswordRequestDto = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

export type ChangePasswordResponseDto = {
  changed: true;
};
