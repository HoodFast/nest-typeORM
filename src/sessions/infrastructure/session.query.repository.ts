import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../domain/session.schema';
import { Injectable } from '@nestjs/common';
import { SessionsOutputType } from '../api/output/session.output';
import { sessionMapper } from '../domain/session.mapper';
import { ObjectId } from 'mongodb';
@Injectable()
export class SessionQueryRepository {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}
  async getAllSessions(userId: string): Promise<SessionsOutputType[] | null> {
    const result = await this.sessionModel.find({
      userId: new ObjectId(userId),
    });
    if (!result) return null;
    return sessionMapper(result);
  }
}
