import { Injectable, NotFoundException } from '@nestjs/common';
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
      console.log();
      return !!result.affected;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async deleteUser(userId: string) {
    try {
      const deleteUser = await this.userRepository.delete(userId);
      if (!deleteUser.affected) return null;
      return !!deleteUser.affected;
    } catch (e) {
      console.log(e);
    }
  }

  async changePass(userId: string, hash: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    user._passwordHash = hash;
    const saveUser = await this.userRepository.save(user);
    return !!saveUser;
  }

  async updateNewConfirmCode(userId: string, code: string): Promise<boolean> {
    try {
      const emailConfirmed = await this.emailConfirmRepository.findOne({
        where: { userId },
      });
      if (!emailConfirmed) throw new NotFoundException();
      emailConfirmed.confirmationCode = code;
      const save = await this.emailConfirmRepository.save(emailConfirmed);
      return !!save;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
}
