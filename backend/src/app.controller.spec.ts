import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: getConnectionToken(),
          useValue: {
            readyState: 1,
            states: { connected: 1 },
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('db-status', () => {
    it('should return connection status', () => {
      const result = appController.getDbStatus();
      expect(result.status).toBe('connected');
    });
  });
});
