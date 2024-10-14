import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../domain/session.schema';
import { Injectable } from '@nestjs/common';
import { SessionsOutputType } from '../api/output/session.output';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
@Injectable()
export class SessionSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async getAllSessions(userId: string): Promise<SessionsOutputType[] | null> {
    const sessions = await this.dataSource.query(
      `
    SELECT  ip, title, iat as "lastActiveDate", "deviceId"
        FROM public.sessions s
        WHERE s."userId" = $1
    `,
      [userId],
    );

    if (!sessions[0]) return null;
    return sessions;
  }
}
