import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../base/models/Interlayer';
import { UpdateOutputData } from '../../../base/models/updateOutput';
import { likesStatuses } from '../../domain/post.schema';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UsersSqlQueryRepository } from '../../../users/infrastructure/users.sql.query.repository';
import { PostsSqlRepository } from '../../infrastructure/posts.sql.repository';
import { PostsSqlQueryRepository } from '../../infrastructure/posts.sql.query.repository';
import { PostType } from '../../infrastructure/mappers/post.mapper';

export class UpdateLikesCommand {
  constructor(
    public likesStatuses: likesStatuses,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateLikesCommand)
export class UpdateLikesUseCase
  implements
    ICommandHandler<UpdateLikesCommand, InterlayerNotice<UpdateOutputData>>
{
  constructor(
    private postsRepository: PostsSqlRepository,
    protected postsQueryRepository: PostsSqlQueryRepository,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}
  async execute(
    command: UpdateLikesCommand,
  ): Promise<InterlayerNotice<UpdateOutputData>> {
    const notice = new InterlayerNotice<UpdateOutputData>();
    const post: PostType | null = await this.postsQueryRepository.getPostById(
      command.postId,
    );
    if (!post) {
      notice.addError('post not found');
      return notice;
    }

    const user = await this.usersSqlQueryRepository.getUserById(command.userId);
    if (!user) {
      notice.addError('user not found');
      return notice;
    }

    const addedLike = await this.postsRepository.updateLikeToPost(
      command.userId,
      command.likesStatuses,
      user.accountData.login,
      command.postId,
    );
    //add like
    // post.addLike(command.userId, command.likesStatuses, user.accountData.login);
    // await post.save();
    notice.addData({ updated: true });
    return notice;
  }
}
