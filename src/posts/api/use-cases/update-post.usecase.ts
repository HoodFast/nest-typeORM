import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../base/models/Interlayer';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostsSqlRepository } from '../../infrastructure/posts.sql.repository';

export class CommandUpdatePostOutputData {
  updated: boolean;
}
export class UpdatePostCommand {
  constructor(
    public postId: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase
  implements
    ICommandHandler<
      UpdatePostCommand,
      InterlayerNotice<CommandUpdatePostOutputData>
    >
{
  constructor(private postsRepository: PostsSqlRepository) {}
  async execute(
    command: UpdatePostCommand,
  ): Promise<InterlayerNotice<CommandUpdatePostOutputData>> {
    const notice = new InterlayerNotice<CommandUpdatePostOutputData>();
    const result = await this.postsRepository.updatePost(
      command.postId,
      command,
    );
    if (!result) notice.addError('updating error');
    notice.addData({ updated: true });
    return notice;
  }
}
