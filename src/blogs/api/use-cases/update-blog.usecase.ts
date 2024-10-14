import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../base/models/Interlayer';

import { BlogsRepository } from '../../infrastructure/blogs.repository';

import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { BlogsSqlRepository } from '../../infrastructure/blogs.sql.repository';
import { BlogsSqlQueryRepository } from '../../infrastructure/blogs.sql.query.repository';

export class CommandUpdateBlogData {
  updated: boolean;
}
export class UpdateBlogCommand {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public blogId: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase
  implements
    ICommandHandler<UpdateBlogCommand, InterlayerNotice<CommandUpdateBlogData>>
{
  constructor(
    private blogsRepository: BlogsSqlRepository,
    private blogsQueryRepository: BlogsSqlQueryRepository,
  ) {}
  async execute(
    command: UpdateBlogCommand,
  ): Promise<InterlayerNotice<CommandUpdateBlogData>> {
    const notice = new InterlayerNotice<CommandUpdateBlogData>();
    const blog = await this.blogsQueryRepository.getBlogById(command.blogId);
    if (!blog) {
      notice.addError('blog not found');
      return notice;
    }
    const result = await this.blogsRepository.updateBlog(
      command.blogId,
      command,
    );
    notice.addData({ updated: result });
    return notice;
  }
}
