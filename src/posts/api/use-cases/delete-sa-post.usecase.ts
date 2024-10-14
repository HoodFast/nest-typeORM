import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../base/models/Interlayer';
import { PostsSqlRepository } from '../../infrastructure/posts.sql.repository';

export class CommandUpdatePostOutputData {
  updated: boolean;
}
export class DeleteSaPostCommand {
  constructor(
    public postId: string,
    public blogId: string,
  ) {}
}

@CommandHandler(DeleteSaPostCommand)
export class DeleteSaPostUseCase
  implements
    ICommandHandler<
      DeleteSaPostCommand,
      InterlayerNotice<CommandUpdatePostOutputData>
    >
{
  constructor(private postsRepository: PostsSqlRepository) {}
  async execute(
    command: DeleteSaPostCommand,
  ): Promise<InterlayerNotice<CommandUpdatePostOutputData>> {
    const notice = new InterlayerNotice<CommandUpdatePostOutputData>();
    const result = await this.postsRepository.deletePost(command.postId);
    if (!result) notice.addError('deleted error');
    notice.addData({ updated: true });
    return notice;
  }
}
