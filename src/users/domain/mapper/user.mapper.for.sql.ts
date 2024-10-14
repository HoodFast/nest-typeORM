import { UserEntity } from '../user.entity';

export const userMapper = (data: any): UserEntity => {
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
      confirmationCode: data.confirmationCode,
      expirationDate: data.expirationDate,
      isConfirmed: data.isConfirmed,
    },
    tokensBlackList: data.tokensBlackList[0].array_agg,
  };
};
