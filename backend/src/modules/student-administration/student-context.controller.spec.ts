import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { SKIP_AUTHORIZATION_KEY } from '../../common/auth/auth.constants';
import { StudentContextController } from './student-context.controller';
import type { StudentContextService } from './student-context.service';

type StudentContextServiceMock = Pick<
  jest.Mocked<StudentContextService>,
  | 'listLinkedStudentsForCurrentAccount'
  | 'switchActiveStudent'
  | 'getCurrentStudent'
>;

describe('StudentContextController', () => {
  it('delegates student context routes and skips permission authorization', async () => {
    const service: StudentContextServiceMock = {
      listLinkedStudentsForCurrentAccount: jest.fn(),
      switchActiveStudent: jest.fn(),
      getCurrentStudent: jest.fn(),
    };
    const controller = new StudentContextController(
      service as StudentContextService,
    );
    const user = {
      id: 'account-1',
      username: 'parent',
      role: 'parent' as const,
    };

    await controller.listSwitchableAccounts(user);
    await controller.switchAccount(user, { student_id: 'student-1' });
    await controller.getCurrentStudent(user);

    expect(service.listLinkedStudentsForCurrentAccount).toHaveBeenCalledWith(
      user,
    );
    expect(service.switchActiveStudent).toHaveBeenCalledWith(user, {
      student_id: 'student-1',
    });
    expect(service.getCurrentStudent).toHaveBeenCalledWith(user);
    expect(
      Reflect.getMetadata(SKIP_AUTHORIZATION_KEY, StudentContextController),
    ).toBe(true);
  });

  it('rejects invalid switch student payloads before service calls', () => {
    const service: StudentContextServiceMock = {
      listLinkedStudentsForCurrentAccount: jest.fn(),
      switchActiveStudent: jest.fn(),
      getCurrentStudent: jest.fn(),
    };
    const controller = new StudentContextController(
      service as StudentContextService,
    );
    const user = {
      id: 'account-1',
      username: 'parent',
      role: 'parent' as const,
    };

    expect(() => controller.switchAccount(user, { student_id: '' })).toThrow(
      BadRequestException,
    );
    expect(() =>
      controller.switchAccount(user, {
        student_id: 'student-1',
        account_id: '',
      }),
    ).toThrow(BadRequestException);
    expect(service.switchActiveStudent).not.toHaveBeenCalled();
  });
});
