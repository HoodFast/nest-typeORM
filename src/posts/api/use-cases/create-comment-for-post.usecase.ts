import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../base/models/Interlayer';

import { PostsQueryRepository } from '../../infrastructure/posts.query.repository';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { CommentDbType } from '../../../comments/domain/comment.schema';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommentsOutputType } from '../../../comments/api/model/output/comments.output';
import { UsersSqlQueryRepository } from '../../../users/infrastructure/users.sql.query.repository';
import { PostsSqlQueryRepository } from '../../infrastructure/posts.sql.query.repository';
import { CommentsSqlRepository } from '../../../comments/infrastructure/comments.sql.repository';

export class CommandCreateCommentForPostOutput {
  commentId: string;
}
export class CreateCommentForPostCommand {
  constructor(
    public postId: string,
    public content: string,
    public userId: string,
    public createdAt = new Date().toISOString(),
  ) {}
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase
  implements
    ICommandHandler<
      CreateCommentForPostCommand,
      InterlayerNotice<CommentsOutputType>
    >
{
  constructor(
    private commentsRepository: CommentsSqlRepository,

    private usersSqlQueryRepository: UsersSqlQueryRepository,
    private postQueryRepository: PostsSqlQueryRepository,
  ) {}
  async execute(
    command: CreateCommentForPostCommand,
  ): Promise<InterlayerNotice<CommentsOutputType>> {
    const notice = new InterlayerNotice<CommentsOutputType>();
    const { userId, postId, content, createdAt } = command;
    const post = await this.postQueryRepository.getPostById(postId, userId);

    if (!post) {
      notice.addError('post don`t exist', 'user', 1);
      return notice;
    }

    const user = await this.usersSqlQueryRepository.getUserById(userId);

    if (!user) {
      notice.addError('user don`t exist', 'user', 1);
      return notice;
    }

    const newComment: CommentDbType = {
      content,
      postId,
      commentatorInfo: {
        userId,
        userLogin: user.accountData.login,
      },
      createdAt,
      likesCount: 0,
      dislikesCount: 0,
      likes: [],
    };

    const result = await this.commentsRepository.createComment(newComment);
    if (!result) {
      notice.addError('blog don`t exist', 'blog', 1);
      return notice;
    }
    notice.addData(result);
    return notice;
  }
}
