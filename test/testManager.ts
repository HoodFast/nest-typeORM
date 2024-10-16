import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserTestManager } from './users/user.test.manager';
import { randomUUID } from 'crypto';
import { SessionEntity } from '../src/sessions/domain/session.entity';

export class TestManager {
  constructor(protected readonly app: INestApplication) {}
  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.name).toBe(responseModel.name);
  }

  async deleteAll() {
    await request(this.app.getHttpServer())
      .delete(`/testing/all-data`)
      .expect(204);
  }

  async createAccessToken() {
    const httpServer = this.app.getHttpServer();
    const userTestManager = new UserTestManager(this.app);
    const random = randomUUID();
    const createUserData = {
      login: `user ${random.substring(0, 3)}`,
      password: `${random.substring(0, 6)}`,
      email: `usermail${random}@mail.ru`,
    };
    await userTestManager.createUser(createUserData, 201);
    const userResponse = await request(httpServer).post('/auth/login').send({
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });
    return userResponse.body.accessToken;
  }
  async createAccessAndRefreshTokenMultiDevices() {
    const httpServer = this.app.getHttpServer();
    const userTestManager = new UserTestManager(this.app);
    const random = randomUUID();
    const createUserData = {
      login: `user ${random.substring(0, 3)}`,
      password: `${random.substring(0, 6)}`,
      email: `usermail${random}@mail.ru`,
    };
    await userTestManager.createUser(createUserData, 201);
    const userResponse1 = await request(httpServer).post('/auth/login').send({
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });
    const userResponse2 = await request(httpServer)
      .post('/auth/login')
      .set('User-Agent', '123')
      .send({
        loginOrEmail: createUserData.login,
        password: createUserData.password,
      });
    const refreshToken = userResponse1.headers[`set-cookie`][0]
      .split('=')[1]
      .split(';')[0];

    const accessToken = userResponse1.body.accessToken;
    return { accessToken, refreshToken };
  }
  async checkSession(session: SessionEntity | null) {
    expect(session).toBeDefined();
    expect(session).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        iat: expect.any(Date),
        expireDate: expect.any(Date),
        userId: expect.any(String),
        deviceId: expect.any(String),
        ip: expect.any(String),
        title: expect.any(String),
      }),
    );
  }
}
