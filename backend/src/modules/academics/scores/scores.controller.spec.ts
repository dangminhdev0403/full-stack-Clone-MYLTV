import 'reflect-metadata';
import {
  REQUIRED_PERMISSIONS_KEY,
  REQUIRED_ROLES_KEY,
} from '../../../common/auth/auth.constants';
import {
  AdminScoresController,
  AppScoresController,
} from './scores.controller';
import type { ScoresService } from './scores.service';
import { PERMISSIONS } from '../../identity-access/permissions/permission.registry';

describe('ScoresControllers', () => {
  let scoresService: jest.Mocked<Partial<ScoresService>>;

  beforeEach(() => {
    scoresService = {
      listScores: jest
        .fn()
        .mockResolvedValue({ success: true, data: { items: [] } }),
      getStudentScores: jest.fn().mockResolvedValue({ success: true }),
      getRewardDiscipline: jest
        .fn()
        .mockResolvedValue({ success: true, data: [{ id: 'r1' }] }),
      saveScoreRecord: jest
        .fn()
        .mockResolvedValue({ success: true, data: { id: 's1' } }),
      saveRewardDisciplineRecord: jest
        .fn()
        .mockResolvedValue({ success: true, data: { id: 'rd1' } }),
    };
  });

  describe('permission registry keys', () => {
    it('contains academics.scores.read and academics.scores.manage', () => {
      const keys = PERMISSIONS.map((p) => p.key);
      expect(keys).toContain('academics.scores.read');
      expect(keys).toContain('academics.scores.manage');
    });
  });

  describe('AppScoresController', () => {
    it('delegates score and reward-discipline queries', async () => {
      const controller = new AppScoresController(
        scoresService as unknown as ScoresService,
      );

      await controller.getScores('student-1', '2026-2027', '1');
      expect(scoresService.getStudentScores).toHaveBeenCalledWith(
        'student-1',
        '2026-2027',
        '1',
      );

      await controller.getRewardDiscipline(
        'student-1',
        '2026-2027',
        '1',
        'reward',
      );
      expect(scoresService.getRewardDiscipline).toHaveBeenCalledWith(
        'student-1',
        '2026-2027',
        '1',
        'reward',
      );
    });
  });

  describe('AdminScoresController', () => {
    it('requires admin or super_admin role on class level', () => {
      expect(
        Reflect.getMetadata(REQUIRED_ROLES_KEY, AdminScoresController),
      ).toEqual(['admin', 'super_admin']);
    });

    it('delegates listScores and requires academics.scores.read permission', async () => {
      const controller = new AdminScoresController(
        scoresService as unknown as ScoresService,
      );
      const query = { student_id: 'student-1', page: 1 };

      await controller.listScores(query);
      expect(scoresService.listScores).toHaveBeenCalledWith(
        expect.objectContaining({ student_id: 'student-1' }),
      );

      const handler = Object.getOwnPropertyDescriptor(
        AdminScoresController.prototype,
        'listScores',
      )?.value as unknown;
      expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
        'academics.scores.read',
      ]);
    });

    it('delegates saveScore and requires academics.scores.manage permission', async () => {
      const controller = new AdminScoresController(
        scoresService as unknown as ScoresService,
      );
      const dto = {
        student_id: 'student-1',
        subject_id: 'toan-hoc',
        subject_name: 'Toán Học',
      };
      const actor = {
        id: 'admin-1',
        username: 'admin',
        role: 'admin' as const,
      };

      await controller.saveScore(dto, actor);
      expect(scoresService.saveScoreRecord).toHaveBeenCalledWith(
        expect.objectContaining(dto),
        actor,
      );

      const handler = Object.getOwnPropertyDescriptor(
        AdminScoresController.prototype,
        'saveScore',
      )?.value as unknown;
      expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
        'academics.scores.manage',
      ]);
    });

    it('delegates saveRewardDiscipline and requires academics.scores.manage permission', async () => {
      const controller = new AdminScoresController(
        scoresService as unknown as ScoresService,
      );
      const dto = {
        student_id: 'student-1',
        type: 'reward' as const,
        title: 'Good job',
        content: 'Well done',
        date: '2026-08-01',
      };
      const actor = {
        id: 'admin-1',
        username: 'admin',
        role: 'admin' as const,
      };

      await controller.saveRewardDiscipline(dto, actor);
      expect(scoresService.saveRewardDisciplineRecord).toHaveBeenCalledWith(
        expect.objectContaining(dto),
        actor,
      );

      const handler = Object.getOwnPropertyDescriptor(
        AdminScoresController.prototype,
        'saveRewardDiscipline',
      )?.value as unknown;
      expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
        'academics.scores.manage',
      ]);
    });

    it('delegates getScores and requires academics.scores.read permission', async () => {
      const controller = new AdminScoresController(
        scoresService as unknown as ScoresService,
      );

      await controller.getScores('student-1', '2026-2027', '1');
      expect(scoresService.getStudentScores).toHaveBeenCalledWith(
        'student-1',
        '2026-2027',
        '1',
      );

      const handler = Object.getOwnPropertyDescriptor(
        AdminScoresController.prototype,
        'getScores',
      )?.value as unknown;
      expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
        'academics.scores.read',
      ]);
    });

    it('delegates getRewardDiscipline and requires academics.scores.read permission', async () => {
      const controller = new AdminScoresController(
        scoresService as unknown as ScoresService,
      );

      await controller.getRewardDiscipline(
        'student-1',
        '2026-2027',
        '1',
        'reward',
      );
      expect(scoresService.getRewardDiscipline).toHaveBeenCalledWith(
        'student-1',
        '2026-2027',
        '1',
        'reward',
      );

      const handler = Object.getOwnPropertyDescriptor(
        AdminScoresController.prototype,
        'getRewardDiscipline',
      )?.value as unknown;
      expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler)).toEqual([
        'academics.scores.read',
      ]);
    });
  });
});
