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
    userId: string,
  ): Promise<Pagination<PostType>> {
    try {
      const { sortBy, sortDirection, pageSize, pageNumber } = data;
      const offset = (pageNumber - 1) * pageSize;

      const posts = await this.dataSource.query(
        `
      SELECT p."id",
       p."title",
       p."shortDescription",
       p."content",p."blogId",
       p."blogName",
       p."createdAt", 
       l."likesStatus" as "myStatus",
       likes."likesCount",
       likes."dislikesCount"
      FROM "posts" p
      LEFT JOIN "like_post" l
      ON  p."id" = l."postId"  AND l."userId" = $3
      LEFT JOIN (
      SELECT "postId",
      COUNT(CASE WHEN "likesStatus" = 'Like' THEN 1 END) as "likesCount",
      COUNT(CASE WHEN "likesStatus" = 'Dislike' THEN 1 END) as "dislikesCount"
      FROM public."like_post" lp
      GROUP BY "postId"
      ) as "likes" ON likes."postId" = p."id"
      ORDER BY p."${sortBy}" ${sortDirection}
      LIMIT $1 OFFSET $2
      `,
        [pageSize, offset, userId],
      );
      const result = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.postLikes', 'like_post')
        .getManyAndCount();
      debugger;
      const totalCount = result[1];
      const pagesCount = Math.ceil(totalCount / pageSize);
      const likes = await this.dataSource.query(`
            SELECT l."updatedAt" as "addedAt", u."id" as "userId", l."login",l."postId"
            FROM public."like_post" l
            LEFT JOIN public."users" u ON u."id" = l."userId"
            WHERE l."likesStatus" = 'Like'
      `);

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
      const res = await this.dataSource.query(
        `
      SELECT p."id",
       p."title",
       p."shortDescription",
       p."content",p."blogId",
       p."blogName",
       p."createdAt", 
       l."likesStatus" as "myStatus",
       likes."likesCount",
       likes."dislikesCount"
      FROM "posts" p
      LEFT JOIN "like_post" l
      ON  p."id" = l."postId"  AND l."userId" = $1
      LEFT JOIN (
      SELECT "postId",
      COUNT(CASE WHEN "likesStatus" = 'Like' THEN 1 END) as "likesCount",
      COUNT(CASE WHEN "likesStatus" = 'Dislike' THEN 1 END) as "dislikesCount"
      FROM public."like_post" lp
      GROUP BY "postId"
      ) as "likes" ON likes."postId" = p."id"
      WHERE p."id" = $2
      `,
        [userId, postId],
      );
      const likes = await this.dataSource.query(
        `
        SELECT l."updatedAt" as "addedAt", u."id" as "userId", l."login",l."postId"
        FROM public."like_post" l
        LEFT JOIN public."users" u ON u."id" = l."userId"
        WHERE l."likesStatus" = 'Like' AND l."postId" = $1
`,
        [postId],
      );
      if (!res[0]) return null;
      return postMapper(res[0], likes);
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
    const offset = (pageNumber - 1) * pageSize;
    const blog = await this.blogsQueryRepository.getBlogById(blogId);
    if (!blog) return null;
    const posts = await this.dataSource.query(
      `
      SELECT p."id",
       p."title",
       p."shortDescription",
       p."content",p."blogId",
       p."blogName",
       p."createdAt", 
       l."likesStatus" as "myStatus",
       likes."likesCount",
       likes."dislikesCount"
      FROM "posts" p
      LEFT JOIN "like_post" l
      ON  p."id" = l."postId"  AND l."userId" = $3
      LEFT JOIN (
      SELECT "postId",
      COUNT(CASE WHEN "likesStatus" = 'Like' THEN 1 END) as "likesCount",
      COUNT(CASE WHEN "likesStatus" = 'Dislike' THEN 1 END) as "dislikesCount"
      FROM public."like_post" lp
      GROUP BY "postId"
      ) as "likes" ON likes."postId" = p."id"
      WHERE p."blogId" = $4
      ORDER BY p."${sortBy}" ${sortDirection}
      LIMIT $1 OFFSET $2
      `,
      [pageSize, offset, userId, blogId],
    );

    const totalCount = await this.dataSource.query(
      `
            SELECT COUNT("id")
            FROM public."posts" p
            WHERE p."blogId" = $1
      `,
      [blogId],
    );
    const pagesCount = Math.ceil(+totalCount[0].count / pageSize);
    const likes = await this.dataSource.query(`
            SELECT l."updatedAt" as "addedAt", u."id" as "userId", l."login",l."postId"
            FROM public."like_post" l
            LEFT JOIN public."users" u ON u."id" = l."userId"
            WHERE l."likesStatus" = 'Like'
      `);
    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: +totalCount[0].count,
      items: posts.map((i: any) => postMapper(i, likes)),
    };
  }
}
