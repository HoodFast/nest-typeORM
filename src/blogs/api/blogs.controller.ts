import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { PostInput } from '../../posts/api/input/PostsCreate.dto';

import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';
import { Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import {
  CommandCreateBlogData,
  CreateBlogCommand,
} from './use-cases/create-blog.usecase';
import { InterlayerNotice } from '../../base/models/Interlayer';
import {
  CommandCreatePostForBlogOutput,
  CreatePostForBlogCommand,
} from '../../posts/api/use-cases/create-post-for-blog.usecase';
import { AuthGuard } from '../../guards/auth.guard';
import { createBlogInputDto } from './model/input/create-blog-input-dto';
import {
  CommandUpdateBlogData,
  UpdateBlogCommand,
} from './use-cases/update-blog.usecase';

import {
  CommandDeleteBlogOutputData,
  DeleteBlogCommand,
} from './use-cases/delete-blog.usecase';
import { AccessTokenGetId } from '../../guards/access.token.get.id';
import { BlogsSqlQueryRepository } from '../infrastructure/blogs.sql.query.repository';
import { PostsSqlQueryRepository } from '../../posts/infrastructure/posts.sql.query.repository';

export enum sortDirection {
  asc = 'asc',
  desc = 'desc',
}

export type queryBlogsInputType = {
  searchNameTerm?: string;
  sortBy?: string;
  sortDirection?: sortDirection;
  pageNumber?: number;
  pageSize?: number;
};

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogService: BlogService,
    protected blogsQueryRepository: BlogsSqlQueryRepository,
    protected postsQueryRepository: PostsSqlQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getAllBlogs(@Query() query: queryBlogsInputType) {
    const sortData = {
      searchNameTerm: query.searchNameTerm ?? '',
      sortBy: query.sortBy ?? 'createdAt',
      sortDirection: query.sortDirection ?? sortDirection.desc,
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
    };

    const blogs = await this.blogsQueryRepository.getAllBlogs(sortData);
    return blogs;
  }

  @Get(':id')
  async getBlogById(@Param('id') blogId: string) {
    const blog = await this.blogsQueryRepository.getBlogById(blogId);
    if (!blog) throw new NotFoundException();
    return blog;
  }
  @UseGuards(AccessTokenGetId)
  @Get(':id/posts')
  async getPostsForBlog(
    @Param('id') blogId: string,
    @Query() query: queryBlogsInputType,
    @Req() req: Request,
  ) {
    const sortData = {
      sortBy: query.sortBy ?? 'createdAt',
      sortDirection: query.sortDirection ?? sortDirection.desc,
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
    };
    // @ts-ignore
    const userId = req.userId ? req.userId : null;
    const posts = await this.postsQueryRepository.getAllPostsForBlog(
      userId,
      blogId,
      sortData,
    );
    if (!posts) throw new NotFoundException();
    return posts;
  }
  @UseGuards(AuthGuard)
  @Post()
  async createBlog(@Body() inputModel: createBlogInputDto) {
    const command = new CreateBlogCommand(
      inputModel.name,
      inputModel.description,
      inputModel.websiteUrl,
    );
    const creatingBlog = await this.commandBus.execute<
      CreateBlogCommand,
      InterlayerNotice<CommandCreateBlogData>
    >(command);
    const blog = await this.blogsQueryRepository.getBlogById(
      creatingBlog.data!.blogId,
    );
    return blog;
  }
  @UseGuards(AuthGuard)
  @Post(':id/posts')
  async createPostForBlog(
    @Param('id') blogId: string,
    @Body() input: PostInput,
  ) {
    const command = new CreatePostForBlogCommand(
      input.title,
      input.content,
      input.shortDescription,
      blogId,
    );

    const creatingPost = await this.commandBus.execute<
      CreatePostForBlogCommand,
      InterlayerNotice<CommandCreatePostForBlogOutput>
    >(command);

    if (creatingPost.hasError())
      throw new NotFoundException(creatingPost.extensions[0].message);
    const post = await this.postsQueryRepository.getPostById(
      creatingPost.data!.postId,
    );
    return post;
  }
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @Put(':id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() body: createBlogInputDto,
  ) {
    const command = new UpdateBlogCommand(
      body.name,
      body.description,
      body.websiteUrl,
      blogId,
    );

    const updatedBlog = await this.commandBus.execute<
      UpdateBlogCommand,
      InterlayerNotice<CommandUpdateBlogData>
    >(command);
    if (updatedBlog.hasError()) throw new NotFoundException();
    return;
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteBlogById(@Param('id') blogId: string) {
    const command = new DeleteBlogCommand(blogId);
    const deletedBlog = await this.commandBus.execute<
      DeleteBlogCommand,
      InterlayerNotice<CommandDeleteBlogOutputData>
    >(command);
    if (deletedBlog.hasError()) throw new NotFoundException();
    return;
  }
}
