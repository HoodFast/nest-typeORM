import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersSqlQueryRepository } from './users/infrastructure/users.sql.query.repository';
import { UsersSqlRepository } from './users/infrastructure/users.sql.repository';
import { UsersService } from './users/application/users.service';
import { BlogsSqlRepository } from './blogs/infrastructure/blogs.sql.repository';
import { BlogsSqlQueryRepository } from './blogs/infrastructure/blogs.sql.query.repository';
import { BlogSortData, SortData } from './base/sortData/sortData.model';
import { createBlogInputDto } from './blogs/api/model/input/create-blog-input-dto';
import { randomUUID } from 'crypto';
import { PostsSqlQueryRepository } from './posts/infrastructure/posts.sql.query.repository';
import {
  InputPostCreate,
  PostCreateData,
} from './posts/api/input/PostsCreate.dto';
import { PostsSqlRepository } from './posts/infrastructure/posts.sql.repository';
import { likesStatuses } from './posts/domain/post.schema';
import { CommentsSqlRepository } from './comments/infrastructure/comments.sql.repository';
import { CommentDbType } from './comments/domain/comment.schema';
import { CommentsSqlQueryRepository } from './comments/infrastructure/comments.sql.query.repository';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    protected userSqlQueryRepository: UsersSqlQueryRepository,
    protected userSqlRepository: UsersSqlRepository,
    protected userService: UsersService,
    protected blogSqlRepository: BlogsSqlRepository,
    protected blogSqlQueryRepository: BlogsSqlQueryRepository,
    protected postSqlQueryRepository: PostsSqlQueryRepository,
    protected postSqlRepository: PostsSqlRepository,
    protected commentsSqlRepository: CommentsSqlRepository,
    protected commentsSqlQueryRepository: CommentsSqlQueryRepository,
  ) {}

  @Get()
  async hello() {
    return 'Start App';
  }
  @Get('getusers')
  async getUsers() {
    return this.userSqlQueryRepository.findUser('123455');
  }
  @Get('getuserbyid')
  async getUsersId() {
    return this.userSqlQueryRepository.getUserById(
      '506195f2-868a-44b4-9191-7855ac3c7d52',
    );
  }
  @Get('getme')
  async getMe() {
    return this.userSqlQueryRepository.getMe(
      '506195f2-868a-44b4-9191-7855ac3c7d52',
    );
  }
  @Get('confirmEmail')
  async addTokenToBlackList() {
    return this.userSqlRepository.confirmEmail(
      '506195f2-868a-44b4-9191-7855ac3c7d52',
    );
  }
  @Get('loginexist')
  async existByLogin() {
    return this.userSqlRepository.doesExistByEmail('trassa@mail.ru');
  }
  @Get('getuserbycode')
  async getUsersCode() {
    return this.userSqlQueryRepository.getUserByCode(
      '4446803e-10e1-42ea-b46f-5a0ee69668f4',
    );
  }
  @Post('createuser')
  async createUser() {
    const login = '123455';
    const email = 'trassa@mail.ru';
    const password = '12345';

    return await this.userService.createUser(login, email, password);
  }

  @Get('get')
  async getAllBlogs() {
    const sortData: BlogSortData = {
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      pageNumber: 1,
      pageSize: 10,
      searchNameTerm: '',
    };
    const res = await this.blogSqlQueryRepository.getAllBlogs(sortData);

    return res;
  }

  @Get('getPosts')
  async getAllPosts() {
    const userId = '98cd1b37-cb25-424c-89be-90f73185b011';
    const sortData: BlogSortData = {
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      pageNumber: 1,
      pageSize: 10,
      searchNameTerm: '',
    };
    const res = await this.postSqlQueryRepository.getAllPosts(sortData, userId);

    return res;
  }

  @Get('getpost')
  async getPost() {
    const sortData: BlogSortData = {
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      pageNumber: 1,
      pageSize: 10,
      searchNameTerm: '',
    };
    const userId = '98cd1b37-cb25-424c-89be-90f73185b011';
    const blogId = '624e210e-5d0a-4fbe-87f2-4990544ec128';
    const res = await this.postSqlQueryRepository.getAllPostsForBlog(
      userId,
      blogId,
      sortData,
    );

    return res;
  }

  @Get('get/:id')
  async getForId(
    @Param('id')
    id: string,
  ) {
    const res = await this.blogSqlQueryRepository.getBlogById(id);
    return res;
  }

  @Post('create_post')
  async createPost() {
    const random = randomUUID();
    const data: PostCreateData = {
      createdAt: new Date(),
      blogId: '624e210e-5d0a-4fbe-87f2-4990544ec128',
      content: `test post content ${random}`,
      title: 'test post title',
      shortDescription: 'test short description',
    };
    const res = await this.postSqlRepository.createPost(
      data,
      '98cd1b37-cb25-424c-89be-90f73185b011',
    );
    return res;
  }

  @Post('update_post')
  async updatePost() {
    const random = randomUUID();
    const data: InputPostCreate = {
      blogId: '624e210e-5d0a-4fbe-87f2-4990544ec128',
      content: `new test post content ${random}`,
      title: 'new test post title',
      shortDescription: 'new test short description',
    };
    const res = await this.postSqlRepository.updatePost(
      '0da7e025-a5b5-429e-937b-3139af8f7b76',
      data,
    );
    return res;
  }

  @Post('update_blog/:id')
  async updateBlog(
    @Param('id')
    id: string,
  ) {
    const updateDate: createBlogInputDto = {
      name: 'blog is updated',
      description: 'blog is updated',
      websiteUrl: 'www.blogisupdated.ru',
    };
    const res = await this.blogSqlRepository.updateBlog(id, updateDate);
    return res;
  }

  @Delete('delete_blog/:id')
  async deleteBlog(
    @Param('id')
    id: string,
  ) {
    const res = await this.blogSqlRepository.deleteBlog(id);
    return res;
  }

  @Post('createLike')
  async createLike() {
    const userId = '4707b8bd-b083-4f84-9f90-bda7b33fc976';
    const likeStatus = likesStatuses.like;
    const login = 'user 088';
    const postId = '08727b44-c144-4e63-b4f8-5c2ba609b104';
    await this.postSqlRepository.updateLikeToPost(
      userId,
      likeStatus,
      login,
      postId,
    );
  }

  @Post('create_comment')
  async createComment() {
    const random = randomUUID();
    const data: CommentDbType = {
      content: 'test content',

      postId: '29ddb035-8188-4632-9dd9-2bb31b60cd03',

      commentatorInfo: {
        userId: '0caec048-1700-449a-972d-f93dafc9095f',
        userLogin: 'lg-332252',
      },

      createdAt: new Date(),

      likesCount: 0,

      dislikesCount: 0,

      likes: [],
    };
    const res = await this.commentsSqlRepository.createComment(data);
    return res;
  }

  @Post('like')
  async like() {
    const res = await this.commentsSqlRepository.addLikeToComment(
      '0caec048-1700-449a-972d-f93dafc9095f',
      '323aa1e6-80c4-46d8-81cc-2efc68a08ade',
      likesStatuses.like,
    );
    return res;
  }

  @Get('get_comments')
  async getComment() {
    const data: SortData = {
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      pageNumber: 1,
      pageSize: 10,
    };
    const res = await this.commentsSqlQueryRepository.getAllByPostId(
      'ba246926-563d-4a6f-9032-2215481e397f',
      'b03b5e57-7d62-4922-97f6-0a48802461a6',
      data,
    );
    return res;
  }

  @Post('update_comment')
  async updateComment() {
    const res = await this.commentsSqlRepository.updateComment(
      'c0e2b2f3-4ce8-48e6-90e4-9c0d077b585f',
      'updated ok',
    );
    return res;
  }

  @Delete('update_comment')
  async deleteComment() {
    const res = await this.commentsSqlRepository.deleteById(
      'b8613099-f652-4153-8e68-b325f69c371f',
    );
    return res;
  }
}
