import { Injectable } from '@nestjs/common';

import { postMapper, postSqlMapper, PostType } from './mappers/post.mapper';
import { Pagination } from '../../base/paginationInputDto/paginationOutput';
import { SortData } from '../../base/sortData/sortData.model';
import { DataSource, Repository } from 'typeorm';
import { BlogsSqlQueryRepository } from '../../blogs/infrastructure/blogs.sql.query.repository';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Posts } from '../domain/post.sql.entity';

@Injectable()
export class PostsSqlQueryRepository {
  constructor(
    protected blogsQueryRepository: BlogsSqlQueryRepository,
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Posts) protected postRepository: Repository<Posts>,
  ) {}

  async getAllPosts(
    data: SortData,
    userId?: string,
  ): Promise<Pagination<PostType>> {
    try {
      const { sortBy, sortDirection, pageSize, pageNumber } = data;
      const mySortDirection =
        sortDirection.toUpperCase() as typeof sortDirection;
      const offset = (pageNumber - 1) * pageSize;

      const result = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.postLikes', 'like_post')
        .orderBy(`post.${sortBy}`, mySortDirection)
        .skip(offset)
        .take(pageSize)
        .getManyAndCount();
      debugger;
      const totalCount = result[1];
      const pagesCount = Math.ceil(totalCount / pageSize);
      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount: totalCount,
        items: result[0].map((i) => postSqlMapper(i, userId)),
      };
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }
  async getPostById(postId: string, userId?: string): Promise<PostType | null> {
    try {
      const result = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.postLikes', 'like_post')
        .where(`post.id = :postId`, { postId })
        .getOne();

      if (!result) return null;
      return postSqlMapper(result, userId);
    } catch (e) {
      console.log(e);
      throw new Error('getPostById');
    }
  }
  async getAllPostsForBlog(
    userId: any,
    blogId: string,
    data: SortData,
  ): Promise<Pagination<PostType> | null> {
    const { sortBy, sortDirection, pageSize, pageNumber } = data;
    const mySortDirection = sortDirection.toUpperCase() as typeof sortDirection;
    const offset = (pageNumber - 1) * pageSize;
    const blog = await this.blogsQueryRepository.getBlogById(blogId);
    if (!blog) return null;

    const result = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.postLikes', 'like_post')
      .orderBy(`post.${sortBy}`, mySortDirection)
      .skip(offset)
      .take(pageSize)
      .where(`post.blogId = :blogId`, { blogId })
      .getManyAndCount();

    const pagesCount = Math.ceil(result[1] / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: result[1],
      items: result[0].map((i: Posts) => postSqlMapper(i, userId)),
    };
  }
}
