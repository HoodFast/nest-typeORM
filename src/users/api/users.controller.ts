import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserInputDto } from './input/userInput.dto';
import { UsersService } from '../application/users.service';
import { UsersSortData } from '../../base/sortData/sortData.model';
import { sortDirection } from '../../blogs/api/blogs.controller';
import { AuthGuard } from '../../guards/auth.guard';
import { OutputUsersType } from './output/users.output.dto';
import { Pagination } from '../../base/paginationInputDto/paginationOutput';
import { UsersSqlQueryRepository } from '../infrastructure/users.sql.query.repository';

// const validateOrRejectModel = async (model: any, ctor: { new (): any }) => {
//   if (!(model instanceof ctor)) {
//     throw new Error('incorrect input data');
//   }
//   try {
//     await validateOrReject(model);
//   } catch (e) {
//     throw new Error(e);
//   }
// };
@UseGuards(AuthGuard)
@Controller('sa/users')
export class UsersController {
  constructor(
    protected userService: UsersService,

    protected usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}
  @Get()
  async getAllUsers(
    @Query() input: UsersSortData,
  ): Promise<Pagination<OutputUsersType>> {
    let mySortDirection = sortDirection.desc;
    if (input.sortDirection) {
      mySortDirection = input.sortDirection.toUpperCase() as sortDirection;
    }

    const sortData: UsersSortData = {
      searchLoginTerm: input.searchLoginTerm ?? '',
      searchEmailTerm: input.searchEmailTerm ?? '',
      sortBy: input.sortBy ?? 'createdAt',
      sortDirection: mySortDirection,
      pageNumber: input.pageNumber ? +input.pageNumber : 1,
      pageSize: input.pageSize ? +input.pageSize : 10,
    };
    const result = await this.usersSqlQueryRepository.getAllUsers(sortData);
    if (!result) throw new NotFoundException();
    return result;
  }
  @UseGuards(AuthGuard)
  @Post()
  async createUser(
    @Body() input: UserInputDto,
  ): Promise<OutputUsersType | null> {
    // await validateOrRejectModel(input, UserInputDto);
    const { login, email, password } = input;
    const createdUser = await this.userService.createUser(
      login,
      email,
      password,
      true,
    );

    return createdUser;
  }
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const deleteUser = await this.userService.deleteUser(id);
    if (!deleteUser) throw new NotFoundException();
    return;
  }
}
