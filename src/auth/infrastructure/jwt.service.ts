import { Injectable } from '@nestjs/common';

import { randomUUID } from 'crypto';
import { SessionRepository } from '../../sessions/infrastructure/session.repository';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../settings/configuration';
import { UsersSqlQueryRepository } from '../../users/infrastructure/users.sql.query.repository';
import { UsersSqlRepository } from '../../users/infrastructure/users.sql.repository';
import { SessionSqlRepository } from '../../sessions/infrastructure/session.sql.repository';
import { SessionEntity } from '../../sessions/domain/session.entity';
const jwt = require('jsonwebtoken');

@Injectable()
export class JwtService {
  constructor(
    private usersSqlQueryRepository: UsersSqlQueryRepository,
    private usersSqlRepository: UsersSqlRepository,

    private configService: ConfigService<ConfigurationType, true>,
    private sessionSqlRepository: SessionSqlRepository,
  ) {}
  private jwtSettings = this.configService.get('jwtSettings', { infer: true });
  private AC_SECRET = this.jwtSettings.AC_SECRET;
  private AC_TIME = this.jwtSettings.AC_TIME;
  private RT_SECRET = this.jwtSettings.RT_SECRET;
  private RT_TIME = this.jwtSettings.RT_TIME;
  private RECOVERY_SECRET = this.jwtSettings.RECOVERY_SECRET;
  private RECOVERY_TIME = this.jwtSettings.RECOVERY_TIME;

  async createJWT(userId: string): Promise<string> {
    const token = jwt.sign({ userId }, this.AC_SECRET, {
      expiresIn: this.AC_TIME,
    });

    return token;
  }
  async createRefreshJWT(
    userId: string,
    deviceId: string = randomUUID(),
    ip: string,
    title: string,
  ): Promise<string | null> {
    const token = jwt.sign({ userId, deviceId }, this.RT_SECRET, {
      expiresIn: this.RT_TIME,
    });

    const decoded = jwt.decode(token, { complete: true });
    const iat = new Date(decoded.payload.iat * 1000);
    const sessionId = randomUUID();
    const tokenMetaData: SessionEntity = {
      id: sessionId,
      iat,
      deviceId,
      expireDate: new Date(decoded.payload.exp * 1000),
      userId: userId,
      ip,
      title,
    };

    const setTokenMetaData =
      await this.sessionSqlRepository.createNewSession(tokenMetaData);
    if (!setTokenMetaData) return null;
    return token;
  }
  async getIatFromToken(refreshToken: string): Promise<Date> {
    const decoded = await jwt.decode(refreshToken, { complete: true });
    const iat = new Date(decoded.payload.iat * 1000);
    return iat;
  }
  async createRecoveryCode(email: string) {
    try {
      const user = await this.usersSqlQueryRepository.findUser(email);
      const token = jwt.sign({ userId: user?._id }, this.RECOVERY_SECRET, {
        expiresIn: this.RECOVERY_TIME,
      });
      return token;
    } catch (e) {}
  }
  async getUserIdByRecoveryCode(code: string): Promise<string> {
    const decoded = await jwt.decode(code, { complete: true });
    return decoded.payload.userId;
  }
  async checkRefreshToken(token: string) {
    try {
      const result = jwt.verify(token, this.RT_SECRET);
      const blackListCheck = await this.usersSqlRepository.blackListCheck(
        result.userId,
        token,
      );
      if (blackListCheck) return null;
      const user = await this.usersSqlQueryRepository.getUserById(
        result.userId,
      );
      return user;
    } catch (err) {
      return null;
    }
  }
  async verifyRefreshToken(token: string) {
    try {
      const result = jwt.verify(token, this.RT_SECRET);
      const date = new Date(result.iat * 1000);
      const blackListCheck =
        await this.sessionSqlRepository.getSessionForRefreshDecodeToken(
          date,
          result.deviceId,
        );

      if (!blackListCheck) return null;
      return result;
    } catch (e) {
      return null;
    }
  }
  async getSessionDataByToken(token: string) {
    try {
      const result = jwt.verify(token, this.RT_SECRET);
      const decoded = jwt.decode(token, { complete: true });
      const userId = decoded.payload.userId;
      const iat = new Date(decoded.payload.iat * 1000);
      const deviceId = result.deviceId;
      return { iat, deviceId, userId };
    } catch (e) {
      console.log(`refresh token: ${e}`);
      return null;
    }
  }
  async getUserIdByToken(token: string): Promise<string | null> {
    try {
      const result = jwt.verify(token, this.AC_SECRET);
      const blackListCheck = await this.usersSqlRepository.blackListCheck(
        result.userId,
        token,
      );
      if (blackListCheck) return null;
      return result.userId;
    } catch (err) {
      return null;
    }
  }
  async getMetaDataByToken(token: string) {
    try {
      const result = jwt.verify(token, this.RT_SECRET);
      const decoded = jwt.decode(token, { complete: true });
      const userId = decoded.payload.userId;
      const iat = new Date(decoded.payload.iat * 1000);
      const deviceId = result.deviceId;
      return { iat, deviceId, userId };
    } catch (e) {
      return null;
    }
  }
}
