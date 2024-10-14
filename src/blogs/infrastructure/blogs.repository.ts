import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../domain/blog.schema';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { createBlogInputDto } from '../api/model/input/create-blog-input-dto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async updateBlog(blogId: string, updateDate: createBlogInputDto) {
    const updatedBlog = await this.blogModel.updateOne(
      { _id: new ObjectId(blogId) },
      {
        $set: {
          name: updateDate.name,
          description: updateDate.description,
          websiteUrl: updateDate.websiteUrl,
        },
      },
    );

    return !!updatedBlog.matchedCount;
  }
  async deleteBlog(id: string) {
    const deleted = await this.blogModel.deleteOne({ _id: new ObjectId(id) });
    return !!deleted.deletedCount;
  }
}
