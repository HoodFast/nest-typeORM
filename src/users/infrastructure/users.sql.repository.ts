import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OutputUsersType } from '../api/output/users.output.dto';
import { Users } from '../domain/user.sql.entity';
import { User } from '../domain/user.schema';
import { EmailConfirmation } from '../domain/email.confirmation.entity';
import { TokensBlackList } from '../domain/tokens.black.list.sql.entity';

@Injectable()
export class UsersSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Users) protected userRepository: Repository<Users>,
    @InjectRepository(TokensBlackList)
    protected tokenRepository: Repository<TokensBlackList>,
    @InjectRepository(EmailConfirmation)
    protected emailConfirmRepository: Repository<EmailConfirmation>,
  ) {}
  async createUser(userData: User): Promise<OutputUsersType | null> {
    const { accountData, emailConfirmation } = userData;

    try {
      const user = new Users();
      const newEmailConfirm = new EmailConfirmation();
      user._passwordHash = accountData._passwordHash;
      user.login = accountData.login;
      user.email = accountData.email;
      user.createdAt = accountData.createdAt;

      newEmailConfirm.confirmationCode = emailConfirmation.confirmationCode;
      newEmailConfirm.expirationDate = emailConfirmation.expirationDate;
      newEmailConfirm.isConfirmed = emailConfirmation.isConfirmed;
      newEmailConfirm.user = user;
      const createdUser = await this.userRepository.save<Users>(user);

      await this.emailConfirmRepository.save<EmailConfirmation>(
        newEmailConfirm,
      );

      const res = await this.userRepository.findOne({
        where: { id: createdUser.id },
      });
      if (!res) return null;

      return {
        id: res.id,
        login: res.login,
        email: res.email,
        createdAt: res.createdAt,
      };
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async blackListCheck(userId: string, token: string): Promise<boolean> {
    const result = await this.tokenRepository.findOne({
      where: { token: token },
    });

    return !!result;
  }

  async doesExistByLogin(login: string): Promise<boolean> {
    const result = await this.userRepository.findOne({ where: { login } });
    return !!result;
  }

  async doesExistByEmail(email: string): Promise<boolean> {
    const result = await this.userRepository.findOne({ where: { email } });
    return !!result;
  }

  async confirmEmail(userId: string) {
    try {
      const result = await this.emailConfirmRepository
        .createQueryBuilder()
        .update(EmailConfirmation)
        .set({
          isConfirmed: true,
        })
        .where('email_confirmation."userId" = :userId', { userId })
        .execute();

      return !!result.affected;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async deleteUser(userId: string) {
    try {
      const deleted = await this.dataSource.query(
        `
    DELETE FROM public."users" u
    WHERE u."id" = $1
    `,
        [userId],
      );

      return !!deleted[1];
    } catch (e) {
      console.log(e);
    }
  }

  async changePass(userId: string, hash: string): Promise<boolean> {
    const res = await this.dataSource.query(
      `
        UPDATE public."users" u
            SET  "_passwordHash"= $2
            WHERE u."id" = $1;
    `,
      [userId, hash],
    );
    return !!res[1];
  }

  async updateNewConfirmCode(userId: string, code: string): Promise<boolean> {
    const res = await this.dataSource.query(
      `
        UPDATE public."email_confirmation" e
            SET  "confirmationCode"= $2
            WHERE e."userId" = $1;
    `,
      [userId, code],
    );
    return !!res[1];
  }
}
