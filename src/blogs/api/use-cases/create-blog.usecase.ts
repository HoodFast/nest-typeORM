import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../base/models/Interlayer';

import { BlogsSqlRepository } from '../../infrastructure/blogs.sql.repository';

export class CommandCreateBlogData {
  blogId: string;
}
export class CreateBlogCommand {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt = new Date().toISOString(),
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements
    ICommandHandler<CreateBlogCommand, InterlayerNotice<CommandCreateBlogData>>
{
  constructor(private blogsRepository: BlogsSqlRepository) {}
  async execute(
    command: CreateBlogCommand,
  ): Promise<InterlayerNotice<CommandCreateBlogData>> {
    const notice = new InterlayerNotice<CommandCreateBlogData>();
    const result = await this.blogsRepository.createBlog(command);
    if (!result) {
      notice.addError('blog don`t create');
      return notice;
    }
    notice.addData({ blogId: result.id });
    return notice;
  }
}
