import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserInputDto } from '../../src/users/api/input/userInput.dto';

export class UserTestManager {
  constructor(protected readonly app: INestApplication) {}
  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.name).toBe(responseModel.name);
  }
  async deleteUser(id: string) {
    await request(this.app.getHttpServer())
      .delete(`/users/${id}`)
      .auth('admin', 'qwerty')
      .expect(204);
  }
  async deleteAll() {
    await request(this.app.getHttpServer()).delete(`/testing/all-data`);
  }
  async createUser(createUserData: UserInputDto, expectStatus: number) {
    const response = await request(this.app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send({ ...createUserData })
      .expect(expectStatus);

    return response;
  }
  async login(
    login: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await request(this.app.getHttpServer())
      .post('/login')
      .send({ login, password })
      .expect(200);
    return {
      accessToken: response.body.accessToken,
      refreshToken: response.headers['set-cookie'][0]
        .split('=')[1]
        .split(';')[0],
    };
  }
  checkValidateErrors(response: any) {
    const result = response.body;

    expect(result).toEqual({
      errorsMessages: [
        { message: expect.any(String), field: expect.any(String) },
        { message: expect.any(String), field: expect.any(String) },
      ],
    });
  }
}
