export type TuitionStatus = 'unpaid' | 'partial' | 'paid' | 'waived';

export type TuitionListQueryDto = {
  student_id?: string;
  class_name?: string;
  semester_id?: string;
  academic_year_id?: string;
  status?: TuitionStatus;
  q?: string;
  page?: string | number;
  page_size?: string | number;
};

export type TuitionCreateDto = {
  student_id: string;
  semester_id: string;
  title: string;
  amount_due: number;
  amount_paid: number;
  due_date: string | null;
  note: string | null;
  is_waived: boolean;
};

export type TuitionUpdateDto = Partial<
  Pick<
    TuitionCreateDto,
    'title' | 'amount_due' | 'amount_paid' | 'due_date' | 'note' | 'is_waived'
  >
>;
