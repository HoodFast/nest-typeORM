import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Session {
  // issuedAt- дата "выпуска"
  @Prop()
  iat: Date;
  @Prop()
  expireDate: Date;
  @Prop()
  userId: ObjectId;
  @Prop()
  deviceId: string;
  @Prop()
  ip: string;
  @Prop()
  title: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
export type SessionDocument = HydratedDocument<Session>;
