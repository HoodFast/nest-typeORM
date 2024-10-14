import { Injectable } from '@nestjs/common';
import { createBlogInputDto } from '../api/model/input/create-blog-input-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { BlogsSqlQueryRepository } from './blogs.sql.query.repository';
import { OutputBlogMapData } from '../api/model/output/outputBlog.model';

@Injectable()
export class BlogsSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected blogSqlRepository: BlogsSqlQueryRepository,
  ) {}

  async createBlog(
    data: createBlogInputDto,
  ): Promise<OutputBlogMapData | null> {
    try {
      const blogId = randomUUID();
      const createdAt = new Date();
      await this.dataSource.query(
        `
            INSERT INTO public."blogs"(
            "id","name","description","websiteUrl","createdAt","isMembership"
            )
            VALUES($1,$2,$3,$4,$5,false)
            `,
        [blogId, data.name, data.description, data.websiteUrl, createdAt],
      );
      const createdBlog = await this.blogSqlRepository.getBlogById(blogId);
      return createdBlog;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
  async updateBlog(blogId: string, updateDate: createBlogInputDto) {
    try {
      await this.dataSource.query(
        `
    UPDATE public."blogs"
    SET "name"=$1, "description" = $2, "websiteUrl" = $3
    WHERE blogs."id" =$4
    `,
        [
          updateDate.name,
          updateDate.description,
          updateDate.websiteUrl,
          blogId,
        ],
      );

      return true;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
  async deleteBlog(blogId: string) {
    try {
      await this.dataSource.query(
        `
        DELETE FROM public."blogs"
        WHERE blogs."id" = $1
    `,
        [blogId],
      );

      return true;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
}
