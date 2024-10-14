import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '../../src/app.module';
import { appSettings } from '../../src/settings/app.settings';
import { UsersService } from '../../src/users/application/users.service';

import request from 'supertest';
import { UsersServiceEmailMock } from '../users/mock/email.mock.class';
import { UserTestManager } from '../users/user.test.manager';
import { errors, usersDto } from '../dtos/test.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let httpServer;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useClass(UsersServiceEmailMock)
      .compile();

    app = moduleFixture.createNestApplication();
    appSettings(app);
    await app.init();
    httpServer = app.getHttpServer();
  });
  afterAll(async () => {
    const userTestManager = new UserTestManager(app);
    await userTestManager.deleteAll();
  });
  afterEach(async () => {
    const userTestManager = new UserTestManager(app);
    await userTestManager.deleteAll();
  });
  expect.setState({
    createUserData: usersDto.createUserData,
    createWrongUserData: usersDto.createWrongUserData,
    emailResendingWrong: usersDto.emailResendingWrong,
  });
  it('-password-recovery incorrect email', async () => {
    await request(httpServer)
      .post('/auth/password-recovery')
      .send({ email: 1234 })
      .expect(400);
  });
  it('-new-password incorrect data', async () => {
    await request(httpServer)
      .post('/auth/new-password')
      .send({ newPassword: 'string', recoveryCode: 'string' })
      .expect(400);
  });
  it('-new-password incorrect code', async () => {
    await request(httpServer)
      .post('/auth/new-password')
      .send({ newPassword: 'string', recoveryCode: 'string11111' })
      .expect(400);
  });
  it('login user', async () => {
    const { createUserData } = expect.getState();
    const userTestManager = new UserTestManager(app);
    await userTestManager.createUser(createUserData, 201);

    const res = await request(httpServer)
      .post('/auth/login')
      .send({
        loginOrEmail: createUserData.login,
        password: createUserData.password,
      })
      .expect(200);

    expect(typeof res.headers['set-cookie'][0]).toBe('string');
    expect(res.body).toEqual({ accessToken: expect.any(String) });
  });
  it('-login user wrong data', async () => {
    const { createUserData, createWrongUserData } = expect.getState();
    const userTestManager = new UserTestManager(app);
    await userTestManager.createUser(createUserData, 201);
    await request(httpServer)
      .post('/auth/login')
      .send({
        loginOrEmail: createWrongUserData.login,
        password: createWrongUserData.password,
      })
      .expect(401);
  });
  it('-login user validation errors', async () => {
    const { createUserData } = expect.getState();
    const userTestManager = new UserTestManager(app);
    await userTestManager.createUser(createUserData, 201);
    const result = await request(httpServer)
      .post('/auth/login')
      .send({
        loginOrEmail: '1234',
        password: 1,
      })
      .expect(400);
    const equalMessage = typeof errors;
    expect(typeof result.body).toEqual(equalMessage);
  });
  it('-refresh token wrong data', async () => {
    await request(httpServer)
      .post('/auth/refresh-token')
      .auth('Cookie', `refreshToken =${'123123'}`)
      .expect(401);
  });
  it('registration-confirmation wrong code', async () => {
    const result = await request(httpServer)
      .post('/auth/registration-confirmation')
      .send({ code: 1234 })
      .expect(400);
    const equalMessage = typeof errors;
    expect(typeof result.body).toEqual(equalMessage);
  });
  it('registration users', async () => {
    const { createUserData } = expect.getState();
    await request(httpServer)
      .post('/auth/registration')
      .auth('admin', 'qwerty')
      .send({ ...createUserData })
      .expect(204);
  });
  it('-registration users this wrong data', async () => {
    const { createWrongUserData } = expect.getState();
    await request(httpServer)
      .post('/auth/registration')
      .send({ ...createWrongUserData })
      .expect(400);
  });
  it('-registration email resending this wrong data', async () => {
    const { emailResendingWrong } = expect.getState();
    await request(httpServer)
      .post('/auth/registration-email-resending')
      .send(emailResendingWrong)
      .expect(400);
  });
  it('logout without token', async () => {
    await request(httpServer).post('/auth/logout').send().expect(401);
  });
  it('get me without token', async () => {
    await request(httpServer).get('/auth/me').send().expect(401);
  });
  it('get me', async () => {
    const { createUserData } = expect.getState();
    const userTestManager = new UserTestManager(app);
    await userTestManager.createUser(createUserData, 201);
    const loginResponse = await request(httpServer).post('/auth/login').send({
      loginOrEmail: createUserData.login,
      password: createUserData.password,
    });
    const token = loginResponse.body.accessToken;

    await request(httpServer)
      .get('/auth/me')
      .auth(token, { type: 'bearer' })
      .expect(200);
  });
});
