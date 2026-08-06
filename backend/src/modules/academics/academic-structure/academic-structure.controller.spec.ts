import 'reflect-metadata';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  REQUIRED_PERMISSIONS_KEY,
  REQUIRED_ROLES_KEY,
} from '../../../common/auth/auth.constants';
import { JwtAuthenticationGuard } from '../../../common/auth/jwt-authentication.guard';
import { PermissionGuard } from '../../../common/auth/permission.guard';
import type { PermissionService } from '../../identity-access/permissions/permission.service';
import { AcademicStructureController } from './academic-structure.controller';
import type { AcademicStructureService } from './academic-structure.service';
import {
  validateAssignStudentEnrollment,
  validateCreateGradeLevel,
  validateCreateSchoolClass,
  validateListClassesQuery,
  validateUpdateGradeLevel,
  validateUpdateSchoolClass,
} from './academic-structure.validation';

describe('AcademicStructureController', () => {
  let mockService: Record<string, jest.Mock>;
  let controller: AcademicStructureController;

  const mockActor = {
    id: 'admin-1',
    username: 'admin',
    role: 'admin' as const,
  };

  beforeEach(() => {
    mockService = {
      listGradeLevels: jest.fn().mockResolvedValue({ success: true }),
      createGradeLevel: jest.fn().mockResolvedValue({ success: true }),
      updateGradeLevel: jest.fn().mockResolvedValue({ success: true }),
      listClasses: jest.fn().mockResolvedValue({ success: true }),
      createClass: jest.fn().mockResolvedValue({ success: true }),
      updateClass: jest.fn().mockResolvedValue({ success: true }),
      getClassRoster: jest.fn().mockResolvedValue({ success: true }),
      assignStudentEnrollment: jest.fn().mockResolvedValue({ success: true }),
      deactivateStudentEnrollment: jest
        .fn()
        .mockResolvedValue({ success: true }),
    };

    controller = new AcademicStructureController(
      mockService as unknown as AcademicStructureService,
    );
  });

  it('declares controller-level admin roles requirement', () => {
    expect(
      Reflect.getMetadata(REQUIRED_ROLES_KEY, AcademicStructureController),
    ).toEqual(['admin', 'super_admin']);
  });

  it('delegates listGradeLevels with academics.structure.read permission', async () => {
    await expect(controller.listGradeLevels()).resolves.toEqual({
      success: true,
    });
    expect(mockService.listGradeLevels).toHaveBeenCalledTimes(1);

    const handler = Object.getOwnPropertyDescriptor(
      AcademicStructureController.prototype,
      'listGradeLevels',
    )?.value as object;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      'academics.structure.read',
    ]);
  });

  it('delegates createGradeLevel with academics.structure.manage permission', async () => {
    const payload = {
      code: 'G10',
      display_name: 'Khối 10',
      sort_order: 10,
    };

    await expect(
      controller.createGradeLevel(payload, mockActor),
    ).resolves.toEqual({ success: true });
    expect(mockService.createGradeLevel).toHaveBeenCalledWith(
      payload,
      mockActor,
    );

    const handler = Object.getOwnPropertyDescriptor(
      AcademicStructureController.prototype,
      'createGradeLevel',
    )?.value as object;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      'academics.structure.manage',
    ]);
  });

  it('delegates updateGradeLevel with academics.structure.manage permission', async () => {
    const payload = { display_name: 'Khối 10 Mới' };

    await expect(
      controller.updateGradeLevel('gl-10', payload, mockActor),
    ).resolves.toEqual({ success: true });
    expect(mockService.updateGradeLevel).toHaveBeenCalledWith(
      'gl-10',
      payload,
      mockActor,
    );

    const handler = Object.getOwnPropertyDescriptor(
      AcademicStructureController.prototype,
      'updateGradeLevel',
    )?.value as object;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      'academics.structure.manage',
    ]);
  });

  it('delegates listClasses with academics.structure.read permission', async () => {
    await expect(
      controller.listClasses('ay-1', 'gl-1', 'true'),
    ).resolves.toEqual({ success: true });
    expect(mockService.listClasses).toHaveBeenCalledWith({
      academic_year_id: 'ay-1',
      grade_level_id: 'gl-1',
      is_active: true,
    });

    const handler = Object.getOwnPropertyDescriptor(
      AcademicStructureController.prototype,
      'listClasses',
    )?.value as object;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      'academics.structure.read',
    ]);
  });

  it('delegates createClass with academics.structure.manage permission', async () => {
    const payload = {
      academic_year_id: 'ay-2025-2026',
      grade_level_id: 'gl-10',
      code: '10A1',
      display_name: 'Lớp 10A1',
    };

    await expect(controller.createClass(payload, mockActor)).resolves.toEqual({
      success: true,
    });
    expect(mockService.createClass).toHaveBeenCalledWith(payload, mockActor);

    const handler = Object.getOwnPropertyDescriptor(
      AcademicStructureController.prototype,
      'createClass',
    )?.value as object;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      'academics.structure.manage',
    ]);
  });

  it('delegates updateClass with academics.structure.manage permission', async () => {
    const payload = { display_name: 'Lớp 10A1 Ver 2' };

    await expect(
      controller.updateClass('class-1', payload, mockActor),
    ).resolves.toEqual({ success: true });
    expect(mockService.updateClass).toHaveBeenCalledWith(
      'class-1',
      payload,
      mockActor,
    );

    const handler = Object.getOwnPropertyDescriptor(
      AcademicStructureController.prototype,
      'updateClass',
    )?.value as object;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      'academics.structure.manage',
    ]);
  });

  it('delegates getClassRoster with academics.structure.read permission', async () => {
    await expect(controller.getClassRoster('class-1', 'true')).resolves.toEqual(
      { success: true },
    );
    expect(mockService.getClassRoster).toHaveBeenCalledWith('class-1', true);

    const handler = Object.getOwnPropertyDescriptor(
      AcademicStructureController.prototype,
      'getClassRoster',
    )?.value as object;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      'academics.structure.read',
    ]);
  });

  it('delegates assignStudentEnrollment with academics.structure.manage permission', async () => {
    const payload = {
      student_id: 'student-1',
      starts_on: '2026-08-01',
    };

    await expect(
      controller.assignStudentEnrollment('class-1', payload, mockActor),
    ).resolves.toEqual({ success: true });
    expect(mockService.assignStudentEnrollment).toHaveBeenCalledWith(
      'class-1',
      payload,
      mockActor,
    );

    const handler = Object.getOwnPropertyDescriptor(
      AcademicStructureController.prototype,
      'assignStudentEnrollment',
    )?.value as object;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
      'academics.structure.manage',
    ]);
  });

  it('rejects an unauthenticated request before authorization', () => {
    const guard = new JwtAuthenticationGuard(new Reflector());
    expect(() => guard.handleRequest(null, false)).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects an authenticated admin without the academics.structure.read permission', async () => {
    const permissionService: Pick<PermissionService, 'userHasPermission'> = {
      userHasPermission: jest.fn().mockResolvedValue(false),
    };
    const guard = new PermissionGuard(
      new Reflector(),
      permissionService as PermissionService,
    );
    const handler = Object.getOwnPropertyDescriptor(
      AcademicStructureController.prototype,
      'listGradeLevels',
    )?.value as () => unknown;
    const context = {
      getClass: () => AcademicStructureController,
      getHandler: () => handler,
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'admin-1', username: 'admin', role: 'admin' },
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  describe('validations', () => {
    it('throws BadRequestException for invalid createGradeLevel payload', () => {
      expect(() => validateCreateGradeLevel({})).toThrow(BadRequestException);
      expect(() =>
        validateCreateGradeLevel({ code: '', display_name: 'Name' }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException for invalid updateGradeLevel payload', () => {
      expect(() => validateUpdateGradeLevel({})).toThrow(BadRequestException);
    });

    it('throws BadRequestException for invalid createSchoolClass payload', () => {
      expect(() => validateCreateSchoolClass({})).toThrow(BadRequestException);
      expect(() =>
        validateCreateSchoolClass({
          academic_year_id: 'ay-1',
          code: '10A1',
        }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException for invalid updateSchoolClass payload', () => {
      expect(() => validateUpdateSchoolClass({})).toThrow(BadRequestException);
    });

    it('throws BadRequestException for invalid assignStudentEnrollment payload', () => {
      expect(() => validateAssignStudentEnrollment({})).toThrow(
        BadRequestException,
      );
      expect(() =>
        validateAssignStudentEnrollment({
          student_id: 's1',
          starts_on: '2026-13-45',
        }),
      ).toThrow(BadRequestException);
    });

    it('parses listClasses query correctly', () => {
      expect(
        validateListClassesQuery({
          academic_year_id: 'ay-1',
          is_active: 'true',
        }),
      ).toEqual({
        academic_year_id: 'ay-1',
        is_active: true,
      });
    });
  });
});
