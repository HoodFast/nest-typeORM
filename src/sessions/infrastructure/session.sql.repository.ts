import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SessionEntity } from '../domain/session.entity';
import { Sessions } from '../domain/session.sql.entity';
@Injectable()
export class SessionSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Sessions)
    protected sessionRepository: Repository<Sessions>,
  ) {}
  async getSessionForUserId(
    userId: string,
    title: string,
  ): Promise<SessionEntity | null> {
    try {
      const session = await this.sessionRepository.findOne({
        where: { userId, title },
      });
      if (!session) return null;
      return session;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async getSessionByDeviceId(deviceId: string): Promise<SessionEntity | null> {
    const result = await this.sessionRepository.findOne({
      where: { deviceId },
    });
    if (!result) return null;
    return result;
  }

  async createNewSession(tokenMetaData: Omit<SessionEntity, 'id'>) {
    try {
      const { iat, title, deviceId, ip, expireDate, userId } = tokenMetaData;

      const session = new Sessions();
      session.iat = iat;
      session.deviceId = deviceId;
      session.ip = ip;
      session.title = title;
      session.userId = userId;
      session.expireDate = expireDate;
      const savedSession = await this.sessionRepository.save(session);

      return savedSession;
    } catch (e) {
      console.log(e);

      return null;
    }
  }
  async deleteById(id: string): Promise<boolean> {
    const result = await this.sessionRepository.delete(id);

    return !!result.affected;
  }
  async deleteByDeviceId(deviceId: string): Promise<boolean> {
    const deletedSession = await this.dataSource.query(
      `
     DELETE FROM public.sessions
            WHERE "deviceId" = $1;
    `,
      [deviceId],
    );
    return !!deletedSession[1];
  }
  async getSessionForRefreshDecodeToken(iat: Date, deviceId: string) {
    try {
      const updatedIat = new Date(iat.getTime() + 3 * 60 * 60 * 1000);
      const metaData = await this.dataSource.query(
        `
     SELECT id, iat, "expireDate", "deviceId", ip, title, "userId"
        FROM public.sessions 
        WHERE ("iat" = $1 OR "iat" = $2) AND "deviceId" = $3;
    `,
        [iat, updatedIat, deviceId],
      );

      return metaData[0];
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async deleteAllSession(userId: string, deviceId: string) {
    const deleteAllSessions = await this.dataSource.query(
      `
        DELETE FROM public.sessions
            WHERE "userId" = $1 AND not("deviceId"=$2);
    `,
      [userId, deviceId],
    );
    return !!deleteAllSessions[1];
  }
}
