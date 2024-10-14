import { OutputUsersType } from '../api/output/users.output.dto';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { User } from '../domain/user.schema';
import { add } from 'date-fns/add';
import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { EmailService } from '../../auth/infrastructure/email.service';
import { recoveryPassInputDto } from '../../auth/api/input/new.password.input';
import { JwtService } from '../../auth/infrastructure/jwt.service';
import { UsersSqlQueryRepository } from '../infrastructure/users.sql.query.repository';
import { UsersSqlRepository } from '../infrastructure/users.sql.repository';

const saltRounds = 10;
@Injectable()
export class UsersService {
  constructor(
    protected usersSqlRepository: UsersSqlRepository,
    protected usersSqlQueryRepository: UsersSqlQueryRepository,
    protected emailService: EmailService,
    protected jwtService: JwtService,
  ) {}
  // async findUser(loginOrEmail: string) {
  //   const user = await this.usersQueryRepository.findUser(loginOrEmail);
  //   return user;
  // }
  async createUser(
    login: string,
    email: string,
    password: string,
    isConfirmed?: boolean,
  ): Promise<OutputUsersType | null> {
    const checkUserExistLogin =
      await this.usersSqlRepository.doesExistByLogin(login);

    if (checkUserExistLogin)
      throw new BadRequestException('user is already exist', 'login');

    const checkUserExistEmail =
      await this.usersSqlRepository.doesExistByEmail(email);

    if (checkUserExistEmail)
      throw new BadRequestException('user is already exist', 'email');

    const createdAt = new Date();

    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);

    const userData: User = {
      accountData: { _passwordHash: hash, createdAt, email, login },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), {
          minutes: 15,
        }),
        isConfirmed: isConfirmed ? isConfirmed : false,
      },
      tokensBlackList: [],
    };

    const createdUser = await this.usersSqlRepository.createUser(userData);
    if (!createdUser) {
      return null;
    }
    try {
      if (!isConfirmed) {
        await this.sendConfirmCode(createdUser.email);
      }
    } catch (e) {
      return null;
    }

    return createdUser;
  }
  async sendConfirmCode(email: string) {
    const user = await this.usersSqlQueryRepository.findUser(email);
    if (!user) return false;
    const subject = 'Email Confirmation';
    const message = `<h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
            <a href='https://somesite.com/confirm-email?code=${user.emailConfirmation.confirmationCode}'>complete registration</a>
        </p>`;
    const send = await this.emailService.sendEmail(email, subject, message);
    return send;
  }
  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<string | null> {
    const user = await this.usersSqlQueryRepository.findUser(loginOrEmail);
    if (!user) return null;
    if (!user.emailConfirmation.isConfirmed) return null;
    const res = await bcrypt.compare(password, user.accountData._passwordHash);
    if (!res) {
      return null;
    } else {
      return user._id;
    }
  }
  async deleteUser(userId: string) {
    const deleteUser = await this.usersSqlRepository.deleteUser(userId);
    return deleteUser;
  }
  async changePass(data: recoveryPassInputDto) {
    try {
      const userId = await this.jwtService.getUserIdByRecoveryCode(
        data.recoveryCode,
      );
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(data.newPassword, salt);
      const changePassword = await this.usersSqlRepository.changePass(
        userId,
        hash,
      );
      return changePassword;
    } catch (e) {
      throw new HttpException({ message: 'Bad request' }, 400);
    }
  }
}
