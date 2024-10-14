export class UserEntity {
  _id: string;
  accountData: {
    _passwordHash: string;
    recoveryCode?: string;
    login: string;
    email: string;
    createdAt: Date;
  };
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };
  tokensBlackList: string[];
}
