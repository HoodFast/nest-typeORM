import { Injectable } from '@nestjs/common';
import { createBlogInputDto } from '../api/model/input/create-blog-input-dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BlogsSqlQueryRepository } from './blogs.sql.query.repository';
import { OutputBlogMapData } from '../api/model/output/outputBlog.model';
import { Blogs } from '../domain/blog.sql.entity';

@Injectable()
export class BlogsSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Blogs) protected blogRepository: Repository<Blogs>,
    protected blogSqlRepository: BlogsSqlQueryRepository,
  ) {}

  async createBlog(
    data: createBlogInputDto,
  ): Promise<OutputBlogMapData | null> {
    try {
      const createdAt = new Date();
      const newBlog = new Blogs();
      newBlog.name = data.name;
      newBlog.description = data.description;
      newBlog.websiteUrl = data.websiteUrl;
      newBlog.createdAt = createdAt;
      newBlog.isMembership = false;
      const savedBlog = await this.blogRepository.save(newBlog);
      const createdBlog = await this.blogSqlRepository.getBlogById(
        savedBlog.id,
      );
      return createdBlog;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
  async updateBlog(
    blogId: string,
    updateDate: createBlogInputDto,
  ): Promise<boolean> {
    try {
      const blog = await this.blogRepository.update(
        { id: blogId },
        {
          name: updateDate.name,
          description: updateDate.description,
          websiteUrl: updateDate.websiteUrl,
        },
      );
      if (!blog) return false;
      return true;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
  async deleteBlog(blogId: string): Promise<boolean> {
    try {
      const result = await this.blogRepository.delete({ id: blogId });
      if (!result) return false;
      return true;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
}
