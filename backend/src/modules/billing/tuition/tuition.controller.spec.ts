import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import {
  REQUIRED_PERMISSIONS_KEY,
  REQUIRED_ROLES_KEY,
} from '../../../common/auth/auth.constants';
import { TuitionController } from './tuition.controller';
import type { TuitionService } from './tuition.service';

describe('TuitionController', () => {
  it('declares admin roles and read/manage permissions', () => {
    const controller = new TuitionController(
      serviceMock() as unknown as TuitionService,
    );
    void controller.list({ page: '1' });
    const list = Object.getOwnPropertyDescriptor(
      TuitionController.prototype,
      'list',
    )?.value as unknown;
    const create = Object.getOwnPropertyDescriptor(
      TuitionController.prototype,
      'create',
    )?.value as unknown;
    expect(Reflect.getMetadata(REQUIRED_ROLES_KEY, TuitionController)).toEqual([
      'admin',
      'super_admin',
    ]);
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, list)).toEqual([
      'billing.tuition.read',
    ]);
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, create)).toEqual([
      'billing.tuition.manage',
    ]);
  });

  it('validates malformed create/update payloads before delegation', () => {
    const service = serviceMock();
    const controller = new TuitionController(
      service as unknown as TuitionService,
    );
    expect(() => controller.create({ title: '' }, undefined)).toThrow(
      BadRequestException,
    );
    expect(() => controller.update('charge-1', {}, undefined)).toThrow(
      BadRequestException,
    );
    expect(service.createCharge).not.toHaveBeenCalled();
    expect(service.updateCharge).not.toHaveBeenCalled();
  });
});

function serviceMock() {
  return {
    listCharges: jest.fn(),
    getCharge: jest.fn(),
    createCharge: jest.fn(),
    updateCharge: jest.fn(),
  };
}
