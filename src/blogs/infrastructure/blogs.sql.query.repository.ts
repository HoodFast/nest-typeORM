import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BlogSortData } from '../../base/sortData/sortData.model';
import { blogMapper } from '../domain/blog.mapper';
import { Blogs } from '../domain/blog.sql.entity';
import { sortDirection } from '../api/blogs.controller';

@Injectable()
export class BlogsSqlQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Blogs) protected blogRepository: Repository<Blogs>,
  ) {}

  async getAllBlogs(sortData: BlogSortData) {
    try {
      const { sortBy, sortDirection, searchNameTerm, pageSize, pageNumber } =
        sortData;
      const mySortDirection =
        sortDirection.toUpperCase() as typeof sortDirection;
      const offset = (pageNumber - 1) * pageSize;
      const result = await this.blogRepository
        .createQueryBuilder('blog')
        .where('blog.name ILIKE :searchLoginTerm ', {
          searchLoginTerm: `%${searchNameTerm}%`,
        })
        .orderBy(`blog.${sortBy}`, mySortDirection)
        .skip(offset)
        .take(pageSize)
        .getManyAndCount();

      const pagesCount = Math.ceil(result[1] / pageSize);

      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount: result[1],
        items: result[0].map(blogMapper),
      };
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
  async getBlogById(id: string) {
    const result = await this.blogRepository
      .createQueryBuilder('blog')
      .where('blog.id = :id', { id })
      .getOne();
    if (!result) return null;
    return blogMapper(result);
  }
}
