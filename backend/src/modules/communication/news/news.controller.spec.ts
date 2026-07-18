import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import {
  REQUIRED_PERMISSIONS_KEY,
  REQUIRED_ROLES_KEY,
} from '../../../common/auth/auth.constants';
import { AdminNewsController, AppNewsController } from './news.controller';
import type { NewsService } from './news.service';

describe('News controllers', () => {
  it('declare business permissions and delegate validated requests', async () => {
    const service = serviceMock();
    const admin = new AdminNewsController(service as unknown as NewsService);
    const app = new AppNewsController(service as unknown as NewsService);
    await admin.create(
      { title: 'T', summary: 'S', content: 'C', category: 'Tin tuc' },
      undefined,
    );
    await app.list({ page: '1' }, undefined);

    const create = Object.getOwnPropertyDescriptor(
      AdminNewsController.prototype,
      'create',
    )?.value as unknown;
    const publish = Object.getOwnPropertyDescriptor(
      AdminNewsController.prototype,
      'publish',
    )?.value as unknown;
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, create)).toEqual([
      'communication.news.manage',
    ]);
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, publish)).toEqual([
      'communication.news.publish',
    ]);
    expect(
      Reflect.getMetadata(REQUIRED_ROLES_KEY, AdminNewsController),
    ).toEqual(['admin', 'super_admin']);
  });

  it('rejects invalid payloads before service invocation', () => {
    const service = serviceMock();
    const controller = new AdminNewsController(
      service as unknown as NewsService,
    );
    expect(() => controller.create({ title: '' }, undefined)).toThrow(
      BadRequestException,
    );
    expect(service.createNews).not.toHaveBeenCalled();
  });
  it('rejects an unbounded audience list before service invocation', () => {
    const service = serviceMock();
    const controller = new AdminNewsController(
      service as unknown as NewsService,
    );

    expect(() =>
      controller.create(
        {
          title: 'T',
          summary: 'S',
          content: 'C',
          category: 'Tin tuc',
          audiences: Array.from({ length: 101 }, (_, index) => ({
            type: 'student' as const,
            value: `student-${index}`,
          })),
        },
        undefined,
      ),
    ).toThrow(BadRequestException);
    expect(service.createNews).not.toHaveBeenCalled();
  });
});

function serviceMock() {
  return {
    listAdminNews: jest.fn(),
    getAdminNews: jest.fn(),
    createNews: jest.fn(),
    updateNews: jest.fn(),
    deleteNews: jest.fn(),
    publishNews: jest.fn(),
    hideNews: jest.fn(),
    pinNews: jest.fn(),
    reorderNews: jest.fn(),
    listPublishedNews: jest.fn(),
  };
}
