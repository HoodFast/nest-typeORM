import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../domain/user.schema';
import { userMapper } from './users.mapper';
import { OutputUsersType } from '../api/output/users.output.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async doesExistByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<boolean> {
    const existCheck = await this.userModel.findOne({
      $or: [{ 'accountData.email': email }, { 'accountData.login': login }],
    });
    return !!existCheck;
  }

  async createUser(userData: User): Promise<OutputUsersType | null> {
    const newUser = new this.userModel(userData);
    await newUser.save();

    const user = await this.userModel.findOne({ _id: newUser.id });
    if (!user) return null;

    return userMapper(user);
  }

  async deleteUser(userId: string) {
    const deleted = await this.userModel.deleteOne({
      _id: new ObjectId(userId),
    });
    return !!deleted.deletedCount;
  }
  async confirmEmail(userId: ObjectId) {
    const confirm = await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          'emailConfirmation.isConfirmed': true,
        },
      },
    );
    return confirm.modifiedCount === 1;
  }
  async changePass(userId: string, hash: string): Promise<boolean> {
    const res = await this.userModel.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: { 'accountData._passwordHash': hash },
      },
    );
    return res.modifiedCount === 1;
  }
  async getUserById(id: string): Promise<UserDocument | null> {
    const res = await this.userModel.findOne({ _id: new ObjectId(id) });
    if (!res) return null;
    return res;
  }
  async blackListCheck(userId: string, token: string): Promise<boolean> {
    const res = await this.userModel.findOne({ _id: new ObjectId(userId) });
    if (!res) return false;
    const blackList = res.tokensBlackList;
    const check = blackList?.includes(token);

    return check;
  }
  async updateNewConfirmCode(userId: string, code: string): Promise<boolean> {
    const res = await this.userModel.updateOne(
      { _id: new Object(userId) },
      {
        $set: {
          'emailConfirmation.confirmationCode': code,
        },
      },
    );
    return res.modifiedCount === 1;
  }
}
