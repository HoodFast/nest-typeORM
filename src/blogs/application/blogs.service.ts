import { Injectable } from '@nestjs/common';
import { BlogsSqlQueryRepository } from '../infrastructure/blogs.sql.query.repository';
import { BlogsSqlRepository } from '../infrastructure/blogs.sql.repository';

@Injectable()
export class BlogService {
  constructor(
    protected blogsRepository: BlogsSqlRepository,
    protected blogsQueryRepository: BlogsSqlQueryRepository,
  ) {}
}
