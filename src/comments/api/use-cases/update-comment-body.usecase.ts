import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../base/models/Interlayer';

import { UpdateOutputData } from '../../../base/models/updateOutput';

import { UsersRepository } from '../../../users/infrastructure/users.repository';

import { CommentDocument } from '../../domain/comment.schema';
import { CommentsQueryRepository } from '../../infrastructure/comments.query.repository';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UsersSqlQueryRepository } from '../../../users/infrastructure/users.sql.query.repository';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql.repository';
import { CommentsSqlQueryRepository } from '../../infrastructure/comments.sql.query.repository';
import { CommentsOutputType } from '../model/output/comments.output';

export class UpdateCommentBodyCommand {
  constructor(
    public content: string,
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentBodyCommand)
export class UpdateCommentBodyUseCase
  implements
    ICommandHandler<
      UpdateCommentBodyCommand,
      InterlayerNotice<UpdateOutputData>
    >
{
  constructor(
    private commentsQueryRepository: CommentsSqlQueryRepository,
    private commentsRepository: CommentsSqlRepository,

    private usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}
  async execute(
    command: UpdateCommentBodyCommand,
  ): Promise<InterlayerNotice<UpdateOutputData>> {
    const notice = new InterlayerNotice<UpdateOutputData>();

    const comment: CommentsOutputType | null =
      await this.commentsQueryRepository.getCommentById(command.commentId);
    if (!comment) {
      notice.addError('comment not found');
      return notice;
    }

    const user = await this.usersSqlQueryRepository.getUserById(command.userId);
    if (!user) {
      notice.addError('user not found');
      return notice;
    }
    if (comment.commentatorInfo.userId !== command.userId)
      throw new ForbiddenException();
    const update = await this.commentsRepository.updateComment(
      command.commentId,
      command.content,
    );
    if (!update) throw new Error('error');
    notice.addData({ updated: true });
    return notice;
  }
}
