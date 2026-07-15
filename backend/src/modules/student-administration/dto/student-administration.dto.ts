export type StudentListQueryDto = {
  q?: string;
  grade?: string;
  class_name?: string;
  is_active?: string | boolean;
  page?: number;
  page_size?: number;
};

export type StudentSummaryDto = {
  id: string;
  code: string;
  full_name: string;
  avatar_url: string | null;
  grade: string | null;
  class_name: string;
  school_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type StudentListResponseDto = {
  items: StudentSummaryDto[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
};

export type StudentWriteRequestDto = {
  code?: string;
  full_name?: string;
  avatar_url?: string | null;
  grade?: string | null;
  class_name?: string;
  school_name?: string;
  guardian_account_ids?: string[];
  is_active?: boolean;
};

export type ReplaceStudentAccountsRequestDto = {
  account_ids: string[];
};

export type ReplaceStudentAccountsResponseDto = {
  updated: true;
};

export type AccountSwitchOptionDto = {
  account_id: string;
  student_id: string;
  student_name: string;
  student_code: string;
  class_name: string;
  grade: string | null;
  avatar_url: string | null;
  is_active: boolean;
};

export type SwitchStudentRequestDto = {
  account_id?: string;
  student_id: string;
};

export type SwitchStudentResponseDto = {
  access_token: string;
  student: {
    id: string;
    full_name: string;
    class_name: string;
  };
};
