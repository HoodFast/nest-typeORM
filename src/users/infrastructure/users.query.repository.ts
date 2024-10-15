import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/user.schema';
import { Model } from 'mongoose';

import { UsersSortData } from '../../base/sortData/sortData.model';
import { Pagination } from '../../base/paginationInputDto/paginationOutput';
import { userMapper } from './users.mapper';
import { OutputUsersType } from '../api/output/users.output.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async findUser(loginOrEmail: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({
      $or: [
        { 'accountData.email': loginOrEmail },
        { 'accountData.login': loginOrEmail },
      ],
    });
    if (!user) return null;
    return user;
  }
  async getAllUsers(
    sortData: UsersSortData,
  ): Promise<Pagination<OutputUsersType>> {
    const {
      searchLoginTerm,
      searchEmailTerm,
      sortDirection,
      sortBy,
      pageSize,
      pageNumber,
    } = sortData;

    const login = searchLoginTerm
      ? {
          'accountData.login': { $regex: `${searchLoginTerm}`, $options: 'i' },
        }
      : {};
    const email = searchLoginTerm
      ? {
          'accountData.email': { $regex: `${searchEmailTerm}`, $options: 'i' },
        }
      : {};
    const filter = {
      $or: [login, email],
    };
    const mySortDirection = sortDirection == 'ASC' ? 1 : -1;
    const users = await this.userModel
      .find(filter)
      .sort({ [`accountData.${sortBy}`]: mySortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);
    const totalCount = await this.userModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: users.map(userMapper),
    };
  }

  async getUserByCode(code: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
    if (!user) return null;
    return user;
  }
  async getMe(userId: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ _id: new ObjectId(userId) });
    if (!user) return null;
    return user;
  }
  async getUserById(userId: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ _id: new ObjectId(userId) });

    if (!user) return null;
    return user;
  }
}
