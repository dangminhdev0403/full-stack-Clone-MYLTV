import { BadRequestException } from '@nestjs/common';
import {
  validateAttendanceCreate,
  validateAttendanceUpdate,
  validateAttendanceList,
} from './attendance.validation';

describe('attendance validation', () => {
  it('normalizes valid filters and write payloads', () => {
    expect(
      validateAttendanceList({
        date: '2026-07-18',
        class_name: ' 6A1 ',
        page: '2',
      }),
    ).toEqual({ date: '2026-07-18', class_name: '6A1', page: 2 });
    expect(
      validateAttendanceCreate({
        date: '2026-07-18',
        class_name: '6A1',
        period: 'morning',
        records: [{ student_id: 'student-1', status: 'present', note: '  ' }],
      }).records[0].note,
    ).toBeNull();
  });

  it('rejects invalid dates, statuses, duplicate students and empty updates', () => {
    expect(() => validateAttendanceList({ date: '2026-02-30' })).toThrow(
      BadRequestException,
    );
    expect(() =>
      validateAttendanceCreate({
        date: '2026-07-18',
        class_name: '6A1',
        period: 'morning',
        records: [{ student_id: 'student-1', status: 'unknown', note: null }],
      } as never),
    ).toThrow(BadRequestException);
    expect(() =>
      validateAttendanceCreate({
        date: '2026-07-18',
        class_name: '6A1',
        period: 'morning',
        records: [
          { student_id: 'student-1', status: 'present', note: null },
          { student_id: 'student-1', status: 'late', note: null },
        ],
      }),
    ).toThrow(BadRequestException);
    expect(() => validateAttendanceUpdate({ records: [] })).toThrow(
      BadRequestException,
    );
  });
});
