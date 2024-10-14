import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../domain/blog.schema';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { BlogSortData } from '../../base/sortData/sortData.model';
import { blogMapper } from '../domain/blog.mapper';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}
  // async getAllBlogs(sortData: BlogSortData) {
  //   const { sortBy, sortDirection, searchNameTerm, pageSize, pageNumber } =
  //     sortData;
  //   let filter = {};
  //   if (searchNameTerm) {
  //     filter = { name: { $regex: searchNameTerm, $options: 'i' } };
  //   }
  //
  //   const blogs = await this.blogModel
  //     .find(filter)
  //     .sort({ [sortBy]: sortDirection })
  //     .skip((pageNumber - 1) * pageSize)
  //     .limit(pageSize);
  //   // const items = posts.map(blogMapper);
  //   // const fakeItems = fakeMappers(
  //   //   items,
  //   //   pageSize,
  //   //   pageNumber,
  //   //   sortDirection,
  //   //   searchNameTerm,
  //   // );
  //   const totalCount = await this.blogModel.countDocuments(filter);
  //   const pagesCount = Math.ceil(totalCount / pageSize);
  //
  //   return {
  //     pagesCount,
  //     page: pageNumber,
  //     pageSize,
  //     totalCount,
  //     items: blogs.map(blogMapper),
  //   };
  // }
  // async getBlogById(id: string) {
  //   const blog = await this.blogModel.findOne({ _id: new ObjectId(id) });
  //
  //   if (!blog) return null;
  //   return blogMapper(blog);
  // }
  async getDbBlogById(id: string) {
    const blog = await this.blogModel.findOne({ _id: new ObjectId(id) });

    if (!blog) return null;
    return blog;
  }
}
