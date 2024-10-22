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
  UseGuards,
} from '@nestjs/common';
import { PostService } from '../application/posts.service';
import { InputPostCreate } from './input/PostsCreate.dto';
import { QueryPostInputModel } from './input/PostsGetInput';
import { sortDirection } from '../../blogs/api/blogs.controller';
import { AuthGuard } from '../../guards/auth.guard';
import {
  CommandCreatePostForBlogOutput,
  CreatePostForBlogCommand,
} from './use-cases/create-post-for-blog.usecase';
import { CommandBus } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../base/models/Interlayer';
import {
  CommandUpdatePostOutputData,
  UpdatePostCommand,
} from './use-cases/update-post.usecase';
import { LikesDto } from './input/likesDtos';
import { AccessTokenAuthGuard } from '../../guards/access.token.auth.guard';
import { UpdateLikesCommand } from './use-cases/update-likes.usecase';
import { UpdateOutputData } from '../../base/models/updateOutput';
import { AccessTokenGetId } from '../../guards/access.token.get.id';
import { CreateCommentForPostCommand } from './use-cases/create-comment-for-post.usecase';
import { CommentsInput } from '../../comments/api/model/input/comments.input';
import { CommentsOutputType } from '../../comments/api/model/output/comments.output';
import { PostsSqlQueryRepository } from '../infrastructure/posts.sql.query.repository';
import { CommentsSqlQueryRepository } from '../../comments/infrastructure/comments.sql.query.repository';

@Controller('sa/posts')
export class PostsSaController {
  constructor(
    protected postService: PostService,
    protected postsQueryRepository: PostsSqlQueryRepository,
    protected commentsQueryRepository: CommentsSqlQueryRepository,
    protected commandBus: CommandBus,
  ) {}
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @Put(':id/like-status')
  async updateLikes(
    @Body() body: LikesDto,
    @Param('id') postId: string,
    @Req() req: Request,
  ) {
    // @ts-ignore
    const userId = req.userId ? req.userId : null;
    const command = new UpdateLikesCommand(body.likeStatus, postId, userId);
    const updateLikes = await this.commandBus.execute<
      UpdateLikesCommand,
      InterlayerNotice<UpdateOutputData>
    >(command);
    if (updateLikes.hasError()) throw new NotFoundException();
    return;
  }
  @UseGuards(AuthGuard)
  @Get()
  async getAllPosts(@Query() query: QueryPostInputModel, @Req() req: Request) {
    const sortData = {
      sortBy: query.sortBy ?? 'createdAt',
      sortDirection: query.sortDirection ?? sortDirection.desc,
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
    };
    // @ts-ignore
    const userId = req.userId ? req.userId : null;
    const posts = await this.postService.getAllPosts(sortData, userId);

    return posts;
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  async getPostById(@Param('id') postId: string, @Req() req: Request) {
    // @ts-ignore
    const userId = req.userId ? req.userId : null;
    const post = await this.postService.getPostById(postId, userId);

    if (!post) throw new NotFoundException();
    return post;
  }
  @UseGuards(AuthGuard)
  @Get(':id/comments')
  async getCommentsForPost(
    @Param('id') postId: string,
    @Query() query: QueryPostInputModel,
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
    const comments = await this.commentsQueryRepository.getAllByPostId(
      userId,
      postId,
      sortData,
    );
    if (!comments) throw new NotFoundException();
    return comments;
  }
  @Post()
  @UseGuards(AuthGuard)
  async createPost(@Body() body: InputPostCreate) {
    const command = new CreatePostForBlogCommand(
      body.title,
      body.shortDescription,
      body.content,
      body.blogId,
    );

    // const userId = '';
    const creatingPost = await this.commandBus.execute<
      CreatePostForBlogCommand,
      InterlayerNotice<CommandCreatePostForBlogOutput>
    >(command);
    if (creatingPost.hasError())
      throw new NotFoundException(creatingPost.extensions[0].message);
    const post = await this.postsQueryRepository.getPostById(
      creatingPost.data!.postId,
    );
    if (!post) throw new NotFoundException();
    return post;
  }
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @Put(':id')
  async updatePost(@Param('id') postId, @Body() model: InputPostCreate) {
    const command = new UpdatePostCommand(
      postId,
      model.title,
      model.shortDescription,
      model.content,
      model.blogId,
    );
    const post = await this.commandBus.execute<
      UpdatePostCommand,
      InterlayerNotice<CommandUpdatePostOutputData>
    >(command);

    if (post.hasError()) throw new NotFoundException();
    return;
  }
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @Delete(':id')
  async deletePost(@Param('id') postId: string) {
    const post = await this.postService.deletePost(postId);
    if (!post) throw new NotFoundException();
    return;
  }
  @UseGuards(AuthGuard)
  @HttpCode(201)
  @Post('/:id/comments')
  async createCommentForPost(
    @Param('id') postId: string,
    @Body() data: CommentsInput,
    @Req() req: Request,
  ) {
    // @ts-ignore
    const userId = req.userId ? req.userId : null;
    const command = new CreateCommentForPostCommand(
      postId,
      data.content,
      userId,
    );
    const createComment = await this.commandBus.execute<
      CreateCommentForPostCommand,
      InterlayerNotice<CommentsOutputType>
    >(command);
    if (createComment.hasError()) throw new NotFoundException();
    return createComment.data;
  }
}
