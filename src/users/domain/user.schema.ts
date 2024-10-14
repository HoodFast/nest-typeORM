import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
class AccountSchema {
  @Prop({ required: true })
  _passwordHash: string;
  @Prop()
  recoveryCode?: string;
  @Prop({ required: true })
  login: string;
  @Prop({ required: true })
  email: string;
  @Prop()
  createdAt: Date;
}

@Schema()
class EmailSchema {
  @Prop()
  confirmationCode: string;
  @Prop()
  expirationDate: Date;
  @Prop()
  isConfirmed: boolean;
}

@Schema()
export class User {
  @Prop()
  accountData: AccountSchema;
  @Prop()
  emailConfirmation: EmailSchema;
  @Prop()
  tokensBlackList: string[];
}

export const UsersSchema = SchemaFactory.createForClass(User);

export type UserDocument = HydratedDocument<User>;
