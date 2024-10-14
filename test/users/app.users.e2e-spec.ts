import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '../../src/app.module';
import { appSettings } from '../../src/settings/app.settings';
import { UsersService } from '../../src/users/application/users.service';
import { UsersServiceEmailMock } from './mock/email.mock.class';
import { UserTestManager } from './user.test.manager';
import request from 'supertest';
import { usersDto } from '../dtos/test.dto';

describe('UsersController (e2e)', () => {
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
  expect.setState({
    createUserData: usersDto.createUserData,
    createWrongUserData: usersDto.createWrongUserData,
  });
  it('create user this correct data', async () => {
    const userTestManager = new UserTestManager(app);
    const { createUserData } = expect.getState();
    const response = await userTestManager.createUser(createUserData, 201);

    expect(response.body).toEqual({
      login: createUserData.login,
      email: createUserData.email,
      id: expect.any(String),
      createdAt: expect.any(String),
    });
  });
  it('user don`t create, validation error status 400', async () => {
    const userTestManager = new UserTestManager(app);
    const { createWrongUserData } = expect.getState();
    const badResponse = await userTestManager.createUser(
      createWrongUserData,
      400,
    );
    userTestManager.checkValidateErrors(badResponse);
  });

  it('user don`t create because unauthorised, status 401', async () => {
    const { createUserData } = expect.getState();
    const response = await request(httpServer)
      .post('/sa/users')
      .send(createUserData)
      .expect(401);
    return response;
  });
});
