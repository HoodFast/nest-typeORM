import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../domain/session.schema';
import { Injectable } from '@nestjs/common';
@Injectable()
export class SessionRepository {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}
  async getSessionForUserId(
    userId: string,
    title: string,
  ): Promise<SessionDocument | null> {
    try {
      const meta = await this.sessionModel.findOne({
        userId: new ObjectId(userId),
        title,
      });
      return meta;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async getSessionByDeviceId(deviceId: string) {
    const session = await this.sessionModel.findOne({ deviceId });
    if (!session) return null;
    return session;
  }
  async getAllSessionByOnlyUserId(userId: string) {
    const session = await this.sessionModel.find({
      userId: new ObjectId(userId),
    });
    if (!session) return null;
    return session;
  }
  async createNewSession(tokenMetaData: Session) {
    const newSession = new this.sessionModel(tokenMetaData);
    await newSession.save();
    const session = await this.sessionModel.findOne({
      deviceId: tokenMetaData.deviceId,
    });
    if (!session) return null;
    return session;
  }
  async deleteById(_id: ObjectId): Promise<boolean> {
    const res = await this.sessionModel.deleteOne({ _id });
    return !!res.deletedCount;
  }
  async deleteByDeviceId(deviceId: string): Promise<boolean> {
    const res = await this.sessionModel.deleteOne({ deviceId });
    return !!res.deletedCount;
  }
  async getSessionForRefreshDecodeToken(iat: string, deviceId: string) {
    const meta = await this.sessionModel.findOne({
      iat: iat,
      deviceId: deviceId,
    });
    return meta;
  }
  async getAllSessionByUserId(userId: string, deviceId: string) {
    const allSessions = this.sessionModel.find({
      userId: new ObjectId(userId),
      deviceId: deviceId,
    });
    return allSessions;
  }
  async deleteAllSession(userId: string, deviceId: string) {
    await this.sessionModel.deleteMany({
      userId: new ObjectId(userId),
      deviceId: { $ne: deviceId },
    });

    return;
  }
}
