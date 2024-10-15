import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UsersSortData } from '../../base/sortData/sortData.model';
import { Pagination } from '../../base/paginationInputDto/paginationOutput';
import { OutputUsersType } from '../api/output/users.output.dto';
import { userMapper } from '../domain/mapper/user.mapper.for.sql';
import { UserEntity } from '../domain/user.entity';
import { MyEntity } from '../../auth/api/output/me.entity';
import { randomUUID } from 'crypto';
import { Users } from '../domain/user.sql.entity';

@Injectable()
export class UsersSqlQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Users) protected usersRepository: Repository<Users>,
  ) {}

  async getAll(): Promise<any> {
    const result = await this.dataSource.query(`
    SELECT id, "login"
        FROM public."users";`);
    return result;
  }
  async findUser(loginOrEmail: string): Promise<UserEntity | null> {
    try {
      const result = await this.usersRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.emailConfirmation', 'email_confirmation')
        .leftJoinAndSelect('user.tokensBlackList', 'TokensBlackList')
        .where(
          `user."login" ILIKE ${loginOrEmail} OR user."email" ILIKE ${loginOrEmail}`,
        )
        .getMany();

      if (!result) return null;
      debugger;
      return userMapper(result[0]);
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

      debugger;

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
    const res = await this.dataSource.query(
      `
    SELECT u."id",
      u."login",
      u."email",
      u."_passwordHash",
      u."recoveryCode",
      u."createdAt",
      e."expirationDate",
      e."isConfirmed",
      e."confirmationCode"
        FROM public."users" u
        LEFT JOIN public."email_confirmation" e
        ON u."id" = e."userId"
        WHERE u."id" = $1
    `,
      [id],
    );
    const tokensBlackList = await this.dataSource.query(
      `
        SELECT  ARRAY_AGG(token)
            FROM public."tokens_black_list" t
            WHERE t."userId" = $1
`,
      [id],
    );

    if (!res[0]) return null;
    return userMapper({ ...res[0], tokensBlackList });
  }
  async getUserByCode(code: string): Promise<UserEntity | null> {
    const res = await this.dataSource.query(
      `
    SELECT u."id",
      u."login",
      u."email",
      u."_passwordHash",
      u."recoveryCode",
      u."createdAt",
      e."expirationDate",
      e."isConfirmed",
      e."confirmationCode"
        FROM public."users" u
        LEFT JOIN public."email_confirmation" e
        ON u."id" = e."userId"
        WHERE e."confirmationCode" = $1
    `,
      [code],
    );
    if (!res[0]) return null;
    const tokensBlackList = await this.dataSource.query(
      `
        SELECT  ARRAY_AGG(token)
            FROM public."tokens_black_list" t
            WHERE t."userId" = $1
`,
      [res[0].id],
    );

    return userMapper({ ...res[0], tokensBlackList });
  }
  async getMe(userId: string): Promise<MyEntity | null> {
    const user = await this.dataSource.query(
      `
    SELECT u."id", u."login", u."email"
    FROM public."users" u
      WHERE u."id" = $1
    `,
      [userId],
    );

    if (!user[0]) return null;
    return {
      id: user[0].id,
      accountData: {
        login: user[0].login,
        email: user[0].email,
      },
    };
  }
  async addTokenToBlackList(userId: string, token: string) {
    try {
      const tokenId = randomUUID();
      await this.dataSource.query(
        `
            INSERT INTO public."tokens_black_list"(
            "id","token","userId")
            VALUES($1,$2,$3);
    `,
        [tokenId, token, userId],
      );
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
