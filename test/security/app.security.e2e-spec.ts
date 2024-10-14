import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { appSettings } from '../../src/settings/app.settings';
import { TestManager } from '../testManager';
import request from 'supertest';

describe('security Controller (e2e)', () => {
  let app: INestApplication;
  let httpServer;
  let testManager;
  let accessTokenUser1;
  let accessTokenUser2;
  let refreshTokenUser1;
  let refreshTokenUser2;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSettings(app);
    await app.init();
    httpServer = app.getHttpServer();

    testManager = new TestManager(app);
    const tokensUser1 =
      await testManager.createAccessAndRefreshTokenMultiDevices();
    accessTokenUser1 = tokensUser1.accessToken;
    refreshTokenUser1 = tokensUser1.refreshToken;
    const tokensUser2 =
      await testManager.createAccessAndRefreshTokenMultiDevices();
    accessTokenUser2 = tokensUser2.accessToken;
    refreshTokenUser2 = tokensUser2.refreshToken;
  });
  beforeEach(async () => {});

  afterAll(async () => {
    await testManager.deleteAll();
  });
  expect.setState({});

  it('comment don`t create, validation error status 400', async () => {
    await request(httpServer)
      .delete('/security/devices')
      .send({ refreshToken: refreshTokenUser1 });
    const user2 = await request(httpServer)
      .get('/security/devices')
      .send({ refreshToken: refreshTokenUser2 });

    return true;
  });
});
