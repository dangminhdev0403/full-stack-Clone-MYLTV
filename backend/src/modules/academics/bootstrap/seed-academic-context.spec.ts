import { seedAcademicContext } from './seed-academic-context';

describe('seedAcademicContext', () => {
  it('idempotently establishes one coherent current context in a transaction', async () => {
    const tx = {
      semester: { updateMany: jest.fn(), upsert: jest.fn() },
      academicYear: { updateMany: jest.fn(), upsert: jest.fn() },
    };
    const transaction = jest.fn(
      async (operation: (client: typeof tx) => Promise<void>) => operation(tx),
    );

    await seedAcademicContext({ $transaction: transaction } as never);
    await seedAcademicContext({ $transaction: transaction } as never);

    expect(transaction).toHaveBeenCalledTimes(2);
    expect(tx.academicYear.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'academic-year-2025-2026' },
        create: expect.objectContaining({
          code: '2025-2026',
          isCurrent: true,
        }) as object,
      }),
    );
    expect(tx.semester.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'semester-2-2025-2026' },
        create: expect.objectContaining({
          academicYearId: 'academic-year-2025-2026',
          sortOrder: 2,
          isCurrent: true,
        }) as object,
      }),
    );
  });
});
