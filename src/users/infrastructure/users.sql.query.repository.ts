import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UsersSortData } from '../../base/sortData/sortData.model';
import { Pagination } from '../../base/paginationInputDto/paginationOutput';
import { OutputUsersType } from '../api/output/users.output.dto';
import { userMapper } from '../domain/mapper/user.mapper.for.sql';
import { UserEntity } from '../domain/user.entity';
import { MyEntity } from '../../auth/api/output/me.entity';
import { Users } from '../domain/user.sql.entity';
import { TokensBlackList } from '../domain/tokens.black.list.sql.entity';

@Injectable()
export class UsersSqlQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Users) protected usersRepository: Repository<Users>,
    @InjectRepository(TokensBlackList)
    protected tokensRepository: Repository<TokensBlackList>,
  ) {}

  // async getAll(): Promise<any> {
  //   const result = await this.dataSource.query(`
  //   SELECT id, "login"
  //       FROM public."users";`);
  //   return result;
  // }
  async findUser(loginOrEmail: string): Promise<UserEntity | null> {
    try {
      const result = await this.usersRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.emailConfirmation', 'email_confirmation')
        .leftJoinAndSelect('user.tokensBlackList', 'TokensBlackList')
        .where(
          `user.login ILIKE :loginOrEmail OR user.email ILIKE :loginOrEmail`,
          { loginOrEmail },
        )
        .getOne();

      if (!result) return null;

      return userMapper(result);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async getAllUsers(
    sortData: UsersSortData,
  ): Promise<Pagination<OutputUsersType> | null> {
    const {
      searchLoginTerm,
      searchEmailTerm,
      sortDirection,
      sortBy,
      pageSize,
      pageNumber,
    } = sortData;

    const offset = (pageNumber - 1) * pageSize;
    try {
      const result = await this.usersRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.login', 'user.email', 'user.createdAt'])
        .where(
          'user.login ILIKE :searchLoginTerm OR user.email ILIKE :searchEmailTerm',
          {
            searchLoginTerm: `%${searchLoginTerm}%`,
            searchEmailTerm: `%${searchEmailTerm}%`,
          },
        )
        .orderBy(`user.${sortBy}`, sortDirection)
        .skip(offset)
        .take(pageSize)
        .getManyAndCount();

      const pagesCount = Math.ceil(result[1] / pageSize);

      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount: result[1],
        items: result[0],
      };
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async getUserById(id: string): Promise<UserEntity | null> {
    const result = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.emailConfirmation', 'email_confirmation')
      .leftJoinAndSelect('user.tokensBlackList', 'TokensBlackList')
      .where('user.id = :id', { id })
      .getOne();

    if (!result) return null;
    return userMapper(result);
  }
  async getUserByCode(code: string): Promise<UserEntity | null> {
    const result = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.emailConfirmation', 'email_confirmation')
      .leftJoinAndSelect('user.tokensBlackList', 'TokensBlackList')
      .where('email_confirmation.confirmationCode = :code', { code })
      .getOne();
    if (!result) return null;

    return userMapper(result);
  }
  async getMe(userId: string): Promise<MyEntity | null> {
    const result = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :userId', { userId })
      .getOne();
    if (!result) return null;
    return {
      id: result.id,
      accountData: {
        login: result.login,
        email: result.email,
      },
    };
  }
  async addTokenToBlackList(userId: string, token: string) {
    try {
      const user = await this.usersRepository
        .createQueryBuilder('user')
        .where('user.id = :userId', { userId })
        .getOne();
      if (!user) return null;
      const blackToken = new TokensBlackList();
      blackToken.token = token;
      blackToken.user = user;
      const addedTokenToBlackList =
        await this.tokensRepository.save(blackToken);

      return !!addedTokenToBlackList;
    } catch (e) {
      console.log(e);
      throw new Error('add token black list is wrong');
    }
  }
}
