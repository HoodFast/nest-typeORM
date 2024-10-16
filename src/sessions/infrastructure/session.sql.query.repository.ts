import { Injectable } from '@nestjs/common';
import { SessionsOutputType } from '../api/output/session.output';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Sessions } from '../domain/session.sql.entity';
@Injectable()
export class SessionSqlQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Sessions) private sessionRepository: Repository<Sessions>,
  ) {}

  async getAllSessions(userId: string): Promise<SessionsOutputType[] | null> {
    try {
      const sessions = await this.sessionRepository
        .createQueryBuilder('sessions')
        .select([
          'sessions.ip',
          'sessions.title',
          'sessions.iat',
          'sessions.deviceId',
        ])
        .where('sessions.userId = :userId', { userId })
        .getManyAndCount();

      if (!sessions.length) return null;
      return sessions[0].map((i) => ({
        ip: i.ip,
        title: i.title,
        lastActiveDate: i.iat,
        deviceId: i.deviceId,
      }));
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async getAll(userId: string) {
    try {
      const sessions = await this.sessionRepository
        .createQueryBuilder('sessions')
        .where('sessions.userId = :userId', { userId })
        .getManyAndCount();

      if (!sessions.length) return null;
      return sessions[0];
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
