import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { REQUIRED_PERMISSIONS_KEY } from '../../common/auth/auth.constants';
import { StudentAdministrationController } from './student-administration.controller';
import type { StudentAdministrationService } from './student-administration.service';

type StudentAdministrationServiceMock = Pick<
  jest.Mocked<StudentAdministrationService>,
  | 'listStudents'
  | 'getStudent'
  | 'createStudent'
  | 'updateStudent'
  | 'replaceStudentAccounts'
>;

describe('StudentAdministrationController', () => {
  it('delegates admin routes and declares permissions', async () => {
    const service: StudentAdministrationServiceMock = {
      listStudents: jest.fn(),
      getStudent: jest.fn(),
      createStudent: jest.fn(),
      updateStudent: jest.fn(),
      replaceStudentAccounts: jest.fn(),
    };
    const controller = new StudentAdministrationController(
      service as StudentAdministrationService,
    );

    await controller.listStudents({ page: '2', page_size: '20' }, undefined);
    await controller.getStudent('student-1', undefined);
    await controller.createStudent(
      { code: 'S001', full_name: 'Student', class_name: '10A1' },
      undefined,
    );
    await controller.updateStudent('student-1', { full_name: 'A' }, undefined);
    await controller.replaceStudentAccounts(
      'student-1',
      { account_ids: ['account-1'] },
      undefined,
    );

    expect(service.listStudents).toHaveBeenCalledWith(
      { page: 2, page_size: 20 },
      undefined,
    );
    expect(service.getStudent).toHaveBeenCalledWith('student-1', undefined);
    const listStudentsHandler = Object.getOwnPropertyDescriptor(
      StudentAdministrationController.prototype,
      'listStudents',
    )?.value as unknown;
    const replaceStudentAccountsHandler = Object.getOwnPropertyDescriptor(
      StudentAdministrationController.prototype,
      'replaceStudentAccounts',
    )?.value as unknown;

    expect(
      Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, listStudentsHandler),
    ).toEqual(['students.read']);
    expect(
      Reflect.getMetadata(
        REQUIRED_PERMISSIONS_KEY,
        replaceStudentAccountsHandler,
      ),
    ).toEqual(['students.accounts.manage']);
  });

  it('rejects invalid student administration payloads before service calls', () => {
    const service: StudentAdministrationServiceMock = {
      listStudents: jest.fn(),
      getStudent: jest.fn(),
      createStudent: jest.fn(),
      updateStudent: jest.fn(),
      replaceStudentAccounts: jest.fn(),
    };
    const controller = new StudentAdministrationController(
      service as StudentAdministrationService,
    );

    expect(() => controller.listStudents({ page: '0' }, undefined)).toThrow(
      BadRequestException,
    );
    expect(() =>
      controller.createStudent(
        { code: '', full_name: 'A', class_name: '10A1' },
        undefined,
      ),
    ).toThrow(BadRequestException);
    expect(() => controller.updateStudent('student-1', {}, undefined)).toThrow(
      BadRequestException,
    );
    expect(() =>
      controller.replaceStudentAccounts(
        'student-1',
        { account_ids: ['account-1', ''] },
        undefined,
      ),
    ).toThrow(BadRequestException);

    expect(service.listStudents).not.toHaveBeenCalled();
    expect(service.createStudent).not.toHaveBeenCalled();
    expect(service.updateStudent).not.toHaveBeenCalled();
    expect(service.replaceStudentAccounts).not.toHaveBeenCalled();
  });
});
