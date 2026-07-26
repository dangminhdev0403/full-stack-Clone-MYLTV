import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import {
  REQUIRED_PERMISSIONS_KEY,
  REQUIRED_ROLES_KEY,
} from '../../../common/auth/auth.constants';
import { AdminFeedbackController } from './feedback.controller';
import type { FeedbackService } from './feedback.service';

describe('AdminFeedbackController', () => {
  it('validates list/status and declares read/manage permissions', async () => {
    const service = mockService();
    const controller = new AdminFeedbackController(
      service as unknown as FeedbackService,
    );
    await controller.list({
      page: '2',
      page_size: '10',
      q: ' hoc ',
      status: 'new',
    });
    await controller.detail('feedback-1');
    await controller.updateStatus(
      'feedback-1',
      { status: 'resolved' },
      actor(),
    );
    expect(service.list).toHaveBeenCalledWith({
      page: 2,
      page_size: 10,
      q: 'hoc',
      status: 'new',
    });
    expect(service.detail).toHaveBeenCalledWith('feedback-1');
    const list = Object.getOwnPropertyDescriptor(
      AdminFeedbackController.prototype,
      'list',
    )?.value as unknown;
    const update = Object.getOwnPropertyDescriptor(
      AdminFeedbackController.prototype,
      'updateStatus',
    )?.value as unknown;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, list)).toEqual([
      'communication.feedback.read',
    ]);
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, update)).toEqual([
      'communication.feedback.manage',
    ]);
    expect(
      Reflect.getMetadata(REQUIRED_ROLES_KEY, AdminFeedbackController),
    ).toEqual(['admin', 'super_admin']);
  });

  it('rejects invalid status and oversized pages', () => {
    const controller = new AdminFeedbackController(
      mockService() as unknown as FeedbackService,
    );
    expect(() => controller.list({ page_size: '101' })).toThrow(
      BadRequestException,
    );
    expect(() =>
      controller.updateStatus('feedback-1', { status: 'deleted' }, actor()),
    ).toThrow(BadRequestException);
    expect(() =>
      controller.list({ page: '1', unexpected: 'field' } as never),
    ).toThrow(BadRequestException);
    expect(() =>
      controller.updateStatus(
        'feedback-1',
        { status: 'resolved', unexpected: 'field' } as never,
        actor(),
      ),
    ).toThrow(BadRequestException);
  });
});

const mockService = () => ({
  list: jest.fn(),
  detail: jest.fn(),
  updateStatus: jest.fn(),
});
const actor = () => ({
  id: 'admin-1',
  username: 'admin',
  role: 'admin' as const,
});
