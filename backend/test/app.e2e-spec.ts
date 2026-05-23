import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  // 1. Initialize the app before all tests
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // 2. Shut down the app (and MongoDB connection) after all tests finish
  afterAll(async () => {
    await app.close();
  });

  // 3. Test your actual database status route instead of the deleted Hello World route
  it('/db-status (GET)', () => {
    return request(app.getHttpServer())
      .get('/db-status')
      .expect(200)
      .expect((res) => {
        // Verify the response contains the status properties from your controller
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('readyState');
      });
  });
});
