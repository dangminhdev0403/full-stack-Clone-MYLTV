import 'reflect-metadata';
import { ok } from '../../common/http/api-response';
import {
  REQUIRED_PERMISSIONS_KEY,
  REQUIRED_ROLES_KEY,
  SKIP_AUTHORIZATION_KEY,
} from '../../common/auth/auth.constants';
import { StudentServicesController } from './student-services.controller';
import type { StudentServicesService } from './student-services.service';
import { PERMISSIONS } from '../identity-access/permissions/permission.registry';

describe('StudentServicesController - Bus Route Seam', () => {
  let service: jest.Mocked<Partial<StudentServicesService>>;
  let controller: StudentServicesController;

  beforeEach(() => {
    service = {
      getBusRoute: jest.fn().mockResolvedValue(
        ok({
          route_id: 'route-01',
          route_name: 'Tuyến Bus 01',
          vehicle_plate: '29B-12345',
          driver_name: 'Bác Bùi Văn Thắng',
          driver_phone: '0987654321',
          student_stop_id: 'stop_2',
          stops: [],
        }),
      ) as any,
    };
    controller = new StudentServicesController(
      service as unknown as StudentServicesService,
    );
  });

  describe('permission registry', () => {
    it('contains student_services.bus.read permission key', () => {
      const keys = PERMISSIONS.map((p) => p.key);
      expect(keys).toContain('student_services.bus.read');
    });
  });

  describe('App bus route endpoint', () => {
    it('delegates to getBusRoute and has SkipAuthorization metadata', async () => {
      const res = (await controller.getBusRoute('student-1')) as any;
      expect(service.getBusRoute).toHaveBeenCalledWith('student-1');
      expect(res.data.route_id).toBe('route-01');

      const handler = Object.getOwnPropertyDescriptor(
        StudentServicesController.prototype,
        'getBusRoute',
      )?.value as unknown;
      expect(Reflect.getMetadata(SKIP_AUTHORIZATION_KEY, handler)).toBe(true);
    });
  });

  describe('Protected Admin bus route endpoint', () => {
    it('delegates to getBusRoute and requires admin roles + student_services.bus.read permission', async () => {
      const adminHandler = Object.getOwnPropertyDescriptor(
        StudentServicesController.prototype,
        'getAdminBusRoute',
      )?.value as unknown;

      expect(adminHandler).toBeDefined();

      const res = await (
        controller as unknown as {
          getAdminBusRoute: (id: string) => Promise<unknown>;
        }
      ).getAdminBusRoute('student-1');
      expect(service.getBusRoute).toHaveBeenCalledWith('student-1');
      expect(res).toEqual(
        ok({
          route_id: 'route-01',
          route_name: 'Tuyến Bus 01',
          vehicle_plate: '29B-12345',
          driver_name: 'Bác Bùi Văn Thắng',
          driver_phone: '0987654321',
          student_stop_id: 'stop_2',
          stops: [],
        }),
      );

      expect(Reflect.getMetadata(REQUIRED_ROLES_KEY, adminHandler!)).toEqual([
        'admin',
        'super_admin',
      ]);
      expect(
        Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, adminHandler!),
      ).toEqual(['student_services.bus.read']);
    });
  });
});
