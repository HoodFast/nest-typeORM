import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetCommentCommand } from './use-cases/get-comment-by-id.usecase';
import { InterlayerNotice } from '../../base/models/Interlayer';
import { CommentsOutputType } from './model/output/comments.output';
import { AccessTokenAuthGuard } from '../../guards/access.token.auth.guard';

import { UpdateCommentLikesCommand } from './use-cases/update-comment-like-status.usecase';
import { UpdateOutputData } from '../../base/models/updateOutput';
import { CommentsInput } from './model/input/comments.input';
import { UpdateCommentBodyCommand } from './use-cases/update-comment-body.usecase';
import { DeleteCommentCommand } from './use-cases/delete-comment.usecase';
import { AccessTokenGetId } from '../../guards/access.token.get.id';
import { LikesDto } from '../../posts/api/input/likesDtos';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  @UseGuards(AccessTokenGetId)
  @Get('/:id')
  async getCommentById(@Param('id') id: string, @Req() req: Request) {
    // @ts-ignore
    const userId = req.userId ? req.userId : null;
    const command = new GetCommentCommand(id, userId);

    const comment = await this.queryBus.execute<
      GetCommentCommand,
      InterlayerNotice<CommentsOutputType>
    >(command);
    if (comment.hasError()) throw new NotFoundException();
    return comment.data;
  }
  @HttpCode(204)
  @UseGuards(AccessTokenAuthGuard)
  @Put('/:id/like-status')
  async updateCommentLikeStatus(
    @Param('id') commentId: string,
    @Req() req: Request,
    @Body() data: LikesDto,
  ) {
    // @ts-ignore
    const userId = req.userId ? req.userId : null;

    const command = new UpdateCommentLikesCommand(
      data.likeStatus,
      commentId,
      userId,
    );

    const updatedLikes = await this.commandBus.execute<
      UpdateCommentLikesCommand,
      InterlayerNotice<UpdateOutputData>
    >(command);

    if (updatedLikes.hasError())
      throw new NotFoundException(`${updatedLikes.extensions}`);
    return;
  }
  @UseGuards(AccessTokenAuthGuard)
  @HttpCode(204)
  @Put('/:id')
  async updateComment(
    @Param('id') commentId: string,
    @Body() data: CommentsInput,
    @Req() req: Request,
  ) {
    // @ts-ignore
    const userId = req.userId ? req.userId : null;

    const command = new UpdateCommentBodyCommand(
      data.content,
      commentId,
      userId,
    );

    const updatedComment = await this.commandBus.execute<
      UpdateCommentBodyCommand,
      InterlayerNotice<UpdateOutputData>
    >(command);

    if (updatedComment.hasError()) throw new NotFoundException();
    return;
  }
  @UseGuards(AccessTokenAuthGuard)
  @Delete('/:id')
  @HttpCode(204)
  async deleteComment(@Param('id') commentId: string, @Req() req: Request) {
    // @ts-ignore
    const userId = req.userId ? req.userId : null;
    const command = new DeleteCommentCommand(commentId, userId);
    const deletedComment = await this.commandBus.execute<
      DeleteCommentCommand,
      InterlayerNotice<UpdateOutputData>
    >(command);

    if (deletedComment.hasError()) throw new NotFoundException();
    return;
  }
}
