import { fail, ok } from './api-response';

describe('api-response helpers', () => {
  it('wraps successful data in the shared envelope', () => {
    expect(ok({ id: 'user-1' })).toEqual({
      success: true,
      data: { id: 'user-1' },
    });
  });

  it('includes response metadata when provided', () => {
    expect(ok(['item-1'], { page: 1, total: 1 })).toEqual({
      success: true,
      data: ['item-1'],
      meta: { page: 1, total: 1 },
    });
  });

  it('wraps errors in the shared error envelope', () => {
    expect(
      fail(
        'VALIDATION_ERROR',
        'Payload is invalid',
        [{ field: 'username' }],
        'req-1',
      ),
    ).toEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Payload is invalid',
        details: [{ field: 'username' }],
      },
      request_id: 'req-1',
    });
  });
});
