import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogSortData } from '../../base/sortData/sortData.model';
import { blogMapper } from '../domain/blog.mapper';

@Injectable()
export class BlogsSqlQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getAllBlogs(sortData: BlogSortData) {
    try {
      const { sortBy, sortDirection, searchNameTerm, pageSize, pageNumber } =
        sortData;
      const offset = (pageNumber - 1) * pageSize;
      const res = await this.dataSource.query(
        `
    SELECT b."id",
      b."name",
      b."description",
      b."websiteUrl",
      b."createdAt",
      b."isMembership"
        FROM public."blogs" b
        WHERE b."name" ILIKE $1 
        ORDER BY b."${sortBy}" ${sortDirection}
        LIMIT $2 OFFSET $3
    `,
        ['%' + searchNameTerm + '%', pageSize, offset],
      );

      const totalCount = await this.dataSource.query(
        `
        SELECT COUNT("id")
        FROM public."blogs" b
        WHERE b."name" ILIKE $1 
        `,
        ['%' + searchNameTerm + '%'],
      );
      const pagesCount = Math.ceil(+totalCount[0].count / pageSize);

      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount: +totalCount[0].count,
        items: res.map(blogMapper),
      };
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
  async getBlogById(id: string) {
    const blog = await this.dataSource.query(
      `
    SELECT b."id",
      b."name",
      b."description",
      b."websiteUrl",
      b."createdAt",
      b."isMembership"
        FROM public."blogs" b
        WHERE b."id" = $1 
    `,
      [id],
    );

    if (!blog[0]) return null;
    return blogMapper(blog[0]);
  }
}
