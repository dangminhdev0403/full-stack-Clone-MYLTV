import { BadRequestException } from '@nestjs/common';
import {
  validateTuitionCreate,
  validateTuitionList,
  validateTuitionUpdate,
} from './tuition.validation';

describe('tuition validation', () => {
  it('accepts bounded list filters and integer VND amounts', () => {
    expect(
      validateTuitionList({
        student_id: 'student-1',
        class_name: '6A1',
        semester_id: 'semester-1',
        status: 'partial',
        page: '2',
      }),
    ).toEqual(
      expect.objectContaining({ status: 'partial', page: 2, page_size: 20 }),
    );
    expect(
      validateTuitionCreate({
        student_id: 'student-1',
        semester_id: 'semester-1',
        title: 'Học phí học kỳ 1',
        amount_due: 12_500_000,
        amount_paid: 5_000_000,
        due_date: '2026-09-15',
      }),
    ).toEqual(expect.objectContaining({ amount_due: 12_500_000 }));
  });

  it.each([
    { amount_due: 1.5 },
    { amount_due: -1 },
    { amount_due: 10, amount_paid: 11 },
    { amount_due: 10, due_date: '2026-02-30' },
    { amount_due: 10, title: '' },
  ])('rejects invalid create payload %#', (payload) => {
    expect(() =>
      validateTuitionCreate({
        student_id: 'student-1',
        semester_id: 'semester-1',
        title: 'Học phí',
        amount_due: 10,
        ...payload,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects empty updates and invalid status filters', () => {
    expect(() => validateTuitionUpdate({})).toThrow(BadRequestException);
    expect(() => validateTuitionList({ status: 'overdue' })).toThrow(
      BadRequestException,
    );
  });
});
