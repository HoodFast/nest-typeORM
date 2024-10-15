import { UserEntity } from '../user.entity';
import { Users } from '../user.sql.entity';

export const userMapper = (data: Users): UserEntity => {
  return {
    _id: data.id,
    accountData: {
      _passwordHash: data._passwordHash,
      recoveryCode: data.recoveryCode,
      login: data.login,
      email: data.email,
      createdAt: data.createdAt,
    },
    emailConfirmation: {
      confirmationCode: data.emailConfirmation[0].confirmationCode,
      expirationDate: data.emailConfirmation[0].expirationDate,
      isConfirmed: data.emailConfirmation[0].isConfirmed,
    },
    tokensBlackList: data.tokensBlackList,
  };
};
