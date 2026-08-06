import 'reflect-metadata';
import {
  REQUIRED_PERMISSIONS_KEY,
  REQUIRED_ROLES_KEY,
} from '../../../common/auth/auth.constants';
import { AttendanceController } from './attendance.controller';
import type { AttendanceService } from './attendance.service';

const actor = { id: 'admin-1', username: 'admin', role: 'admin' as const };

describe('AttendanceController', () => {
  it('delegates list/create/get/update and declares attendance permissions', async () => {
    const service = {
      listSessions: jest.fn().mockResolvedValue({ success: true }),
      createSession: jest.fn().mockResolvedValue({ success: true }),
      getSession: jest.fn().mockResolvedValue({ success: true }),
      updateSession: jest.fn().mockResolvedValue({ success: true }),
      getStudentAttendanceHistory: jest
        .fn()
        .mockResolvedValue({ success: true }),
    };
    const controller = new AttendanceController(
      service as unknown as AttendanceService,
    );
    await controller.list({ date: '2026-07-18' });
    await controller.create(
      {
        date: '2026-07-18',
        class_name: '6A1',
        period: 'morning',
        records: [{ student_id: 'student-1', status: 'present', note: null }],
      },
      actor,
    );
    await controller.get('session-1');
    await controller.update(
      'session-1',
      { records: [{ student_id: 'student-1', status: 'present', note: null }] },
      actor,
    );
    await controller.getStudentAttendance('student-1');
    expect(service.listSessions).toHaveBeenCalled();
    expect(service.createSession).toHaveBeenCalled();
    expect(service.getSession).toHaveBeenCalledWith('session-1');
    expect(service.updateSession).toHaveBeenCalled();
    expect(service.getStudentAttendanceHistory).toHaveBeenCalledWith(
      'student-1',
    );
    expect(
      Reflect.getMetadata(REQUIRED_ROLES_KEY, AttendanceController),
    ).toEqual(['admin', 'super_admin']);
    for (const [method, permission] of [
      ['list', 'academics.attendance.read'],
      ['get', 'academics.attendance.read'],
      ['create', 'academics.attendance.manage'],
      ['update', 'academics.attendance.manage'],
      ['getStudentAttendance', 'academics.attendance.read'],
    ] as const) {
      const handler = Object.getOwnPropertyDescriptor(
        AttendanceController.prototype,
        method,
      )?.value as unknown;
      expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
        permission,
      ]);
    }
  });
});
