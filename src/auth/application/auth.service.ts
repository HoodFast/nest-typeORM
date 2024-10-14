import { SessionRepository } from '../../sessions/infrastructure/session.repository';
import { JwtService } from '../infrastructure/jwt.service';
import { UsersService } from '../../users/application/users.service';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { EmailService } from '../infrastructure/email.service';
import { UsersSqlQueryRepository } from '../../users/infrastructure/users.sql.query.repository';
import { UserEntity } from '../../users/domain/user.entity';
import { UsersSqlRepository } from '../../users/infrastructure/users.sql.repository';
import { SessionSqlRepository } from '../../sessions/infrastructure/session.sql.repository';
const jwt = require('jsonwebtoken');
@Injectable()
export class AuthService {
  constructor(
    protected usersService: UsersService,

    protected sessionSqlRepository: SessionSqlRepository,
    protected jwtService: JwtService,

    protected usersSqlQueryRepository: UsersSqlQueryRepository,

    protected usersSqlRepository: UsersSqlRepository,
    protected emailService: EmailService,
  ) {}
  async confirmEmail(code: string) {
    const user = await this.usersSqlQueryRepository.getUserByCode(code);
    if (!user) throw new BadRequestException('invalid code', 'code');
    if (user?.emailConfirmation.isConfirmed)
      throw new BadRequestException('code is already confirm', 'code');

    if (user?.emailConfirmation.expirationDate < new Date()) {
      throw new BadRequestException({
        message: 'expired',
        field: 'expirationDate',
      });
    }
    const confirmEmail = await this.usersSqlRepository.confirmEmail(user._id);
    return confirmEmail;
  }
  async sendRecovery(email: string) {
    const subject = 'Password recovery';
    const recoveryCode = this.jwtService.createRecoveryCode(email);
    const message = `<h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
      </p>`;
    try {
      await this.emailService.sendEmail(email, subject, message);
    } catch (e) {
      return;
    }
    return;
  }

  async loginTokensPair(
    loginOrEmail: string,
    password: string,
    ip: string,
    title: string,
  ) {
    const userId = await this.usersService.checkCredentials(
      loginOrEmail,
      password,
    );

    if (!userId) return null;
    const oldSession = await this.sessionSqlRepository.getSessionForUserId(
      userId.toString(),
      title,
    );

    const deviceId = oldSession?.deviceId || randomUUID();

    if (oldSession) {
      await this.sessionSqlRepository.deleteById(oldSession.id);
    }

    const accessToken = await this.jwtService.createJWT(userId);
    if (!accessToken) return null;

    const refreshToken = await this.jwtService.createRefreshJWT(
      userId,
      deviceId,
      ip,
      title,
    );
    if (!refreshToken) return null;
    // const decoded = jwt.decode(refreshToken, { complete: true });
    // const iat = await this.jwtService.getIatFromToken(refreshToken);
    // const tokenMetaData: Session = {
    //   iat,
    //   deviceId,
    //   expireDate: decoded.payload.exp,
    //   userId,
    //   ip,
    //   title,
    // };
    // const setTokenMetaData =
    //   await this.sessionRepository.createNewSession(tokenMetaData);
    // if (!setTokenMetaData) return null;
    return { accessToken, refreshToken };
  }

  async refreshTokensPair(
    user: UserEntity,
    ip: string,
    title: string,
    token: string,
  ) {
    const session: { iat: Date; deviceId: string; userId: string } | null =
      await this.jwtService.getSessionDataByToken(token);
    console.log(`session result:${session}`);
    if (!session)
      throw new UnauthorizedException('couldn`t get the data session');

    const oldSession =
      await this.sessionSqlRepository.getSessionForRefreshDecodeToken(
        session.iat,
        session.deviceId,
      );

    const deviceId = oldSession?.deviceId;
    if (oldSession) {
      await this.sessionSqlRepository.deleteById(oldSession.id);
    } else {
      throw new UnauthorizedException('The old session is gone');
    }
    const accessToken = await this.jwtService.createJWT(user._id);
    const refreshToken = await this.jwtService.createRefreshJWT(
      user._id,
      deviceId,
      ip,
      title,
    );
    return { accessToken, refreshToken };
  }
  async resendConfirmationCode(email: string) {
    const user = await this.usersSqlQueryRepository.findUser(email);
    if (!user) throw new BadRequestException('mail doesnt exist', 'email');
    if (user?.emailConfirmation.isConfirmed)
      throw new BadRequestException('code is already confirm', 'email');

    const newConfirmCode = randomUUID();
    const updateConfirmCode =
      await this.usersSqlRepository.updateNewConfirmCode(
        user?._id,
        newConfirmCode,
      );
    if (!updateConfirmCode) return false;
    const subject = 'Email Confirmation';
    const message = `<h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
            <a href='https://somesite.com/confirm-email?code=${newConfirmCode}'>complete registration</a>
        </p>`;
    const sendMail = await this.emailService.sendEmail(email, subject, message);
    return sendMail;
  }
  async deleteSession(token: string): Promise<boolean> {
    const dataSession = await this.jwtService.getSessionDataByToken(token);
    if (!dataSession) return false;
    const oldSession =
      await this.sessionSqlRepository.getSessionForRefreshDecodeToken(
        dataSession.iat,
        dataSession.deviceId,
      );
    if (oldSession) {
      return await this.sessionSqlRepository.deleteById(oldSession.id);
    } else {
      return false;
    }
  }
  async deleteSessionUsingLogin(
    userId: string,
    title: string,
  ): Promise<boolean> {
    const dataSession = await this.sessionSqlRepository.getSessionForUserId(
      userId,
      title,
    );
    if (!dataSession) return false;

    await this.sessionSqlRepository.deleteById(dataSession.id);

    return true;
  }
}
