import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../base/models/Interlayer';
import { CommentsOutputType } from '../model/output/comments.output';
import { CommentsQueryRepository } from '../../infrastructure/comments.query.repository';
import { CommentsSqlQueryRepository } from '../../infrastructure/comments.sql.query.repository';

export class GetCommentCommand {
  constructor(
    public id: string,
    public userId: string,
  ) {}
}
@QueryHandler(GetCommentCommand)
export class GetCommentUseCase
  implements
    IQueryHandler<GetCommentCommand, InterlayerNotice<CommentsOutputType>>
{
  constructor(private commentsQueryRepository: CommentsSqlQueryRepository) {}
  async execute(
    command: GetCommentCommand,
  ): Promise<InterlayerNotice<CommentsOutputType>> {
    const notice = new InterlayerNotice<CommentsOutputType>();
    const comment = await this.commentsQueryRepository.getCommentById(
      command.id,
      command.userId,
    );

    if (!comment) {
      notice.addError('comment not found');
      return notice;
    }
    notice.addData(comment);
    return notice;
  }
}
