import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../domain/post.schema';

import { postMapper, PostType } from './mappers/post.mapper';
import { ObjectId } from 'mongodb';
import { Pagination } from '../../base/paginationInputDto/paginationOutput';
import { SortData } from '../../base/sortData/sortData.model';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query.repository';
import { BlogsSqlQueryRepository } from '../../blogs/infrastructure/blogs.sql.query.repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    protected blogsQueryRepository: BlogsSqlQueryRepository,
  ) {}

  // async getAllPosts(
  //   data: SortData,
  //   userId: string,
  // ): Promise<Pagination<PostType>> {
  //   const { sortBy, sortDirection, pageSize, pageNumber } = data;
  //   const mySortDirection = sortDirection == 'asc' ? 1 : -1;
  //   const posts = await this.postModel
  //     .find({})
  //     .sort({ [sortBy]: mySortDirection })
  //     .skip((pageNumber - 1) * pageSize)
  //     .limit(pageSize);
  //
  //   const totalCount = await this.postModel.countDocuments({});
  //   const pagesCount = Math.ceil(totalCount / pageSize);
  //
  //   return {
  //     pagesCount,
  //     page: pageNumber,
  //     pageSize,
  //     totalCount,
  //     items: posts.map((i) => postMapper(i, userId)),
  //   };
  // }
  async getPostById(
    postId: string,
    userId: any = '',
  ): Promise<PostType | null> {
    const res: any = await this.postModel.find({
      _id: new ObjectId(postId),
    });
    if (!res.length) return null;
    return postMapper(res[0], userId);
  }
  async getAllPostsForBlog(
    userId: any,
    blogId: string,
    data: SortData,
  ): Promise<Pagination<PostType> | null> {
    const { sortBy, sortDirection, pageSize, pageNumber } = data;
    const blog = await this.blogsQueryRepository.getBlogById(blogId);
    if (!blog) return null;
    const mySortDirection = sortDirection == 'ASC' ? 1 : -1;
    const posts = await this.postModel
      .find({ blogId: blogId })
      .sort({ [sortBy]: mySortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const totalCount = await this.postModel.countDocuments({ blogId: blogId });
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: posts.map((i: any) => postMapper(i, userId)),
    };
  }
}
