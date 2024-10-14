import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../base/models/Interlayer';

import { BlogsRepository } from '../../infrastructure/blogs.repository';

import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { BlogsSqlQueryRepository } from '../../infrastructure/blogs.sql.query.repository';
import { BlogsSqlRepository } from '../../infrastructure/blogs.sql.repository';

export class CommandDeleteBlogOutputData {
  deleted: boolean;
}
export class DeleteBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase
  implements
    ICommandHandler<
      DeleteBlogCommand,
      InterlayerNotice<CommandDeleteBlogOutputData>
    >
{
  constructor(
    private blogsRepository: BlogsSqlRepository,
    private blogsQueryRepository: BlogsSqlQueryRepository,
  ) {}
  async execute(
    command: DeleteBlogCommand,
  ): Promise<InterlayerNotice<CommandDeleteBlogOutputData>> {
    const notice = new InterlayerNotice<CommandDeleteBlogOutputData>();
    const blog = await this.blogsQueryRepository.getBlogById(command.blogId);
    if (!blog) {
      notice.addError('not found blog');
      return notice;
    }
    const result = await this.blogsRepository.deleteBlog(command.blogId);
    notice.addData({ deleted: result });
    return notice;
  }
}
