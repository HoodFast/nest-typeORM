import { UsersService } from '../../../src/users/application/users.service';

export class UsersServiceEmailMock extends UsersService {
  sendMessageOnEmail(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
