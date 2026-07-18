export type AttendancePeriodDto = 'morning' | 'afternoon';
export type AttendanceStatusDto = 'present' | 'absent' | 'late' | 'excused';

export type AttendanceRecordWriteDto = {
  student_id: string;
  status: AttendanceStatusDto;
  note: string | null;
};

export type AttendanceSessionWriteDto = {
  date?: string;
  class_name?: string;
  period?: AttendancePeriodDto;
  records: AttendanceRecordWriteDto[];
};

export type AttendanceListQueryDto = {
  date?: string;
  class_name?: string;
  period?: AttendancePeriodDto;
  page?: number | string;
  page_size?: number | string;
};
