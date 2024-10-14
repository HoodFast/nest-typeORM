import { UserDocument } from '../domain/user.schema';
import { OutputUsersType } from '../api/output/users.output.dto';

export const userMapper = (user: UserDocument): OutputUsersType => {
  return {
    id: user._id.toString(),
    login: user.accountData.login,
    email: user.accountData.email,
    createdAt: user.accountData.createdAt,
  };
};
