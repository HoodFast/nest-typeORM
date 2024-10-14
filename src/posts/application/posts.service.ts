import { PostsRepository } from '../infrastructure/posts.repository';
import { Injectable } from '@nestjs/common';

import { PostsQueryRepository } from '../infrastructure/posts.query.repository';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query.repository';
import { InputPostCreate, PostCreateData } from '../api/input/PostsCreate.dto';
import { SortData } from '../../base/sortData/sortData.model';
import { PostsSqlQueryRepository } from '../infrastructure/posts.sql.query.repository';
import { BlogsSqlQueryRepository } from '../../blogs/infrastructure/blogs.sql.query.repository';
import { PostsSqlRepository } from '../infrastructure/posts.sql.repository';

@Injectable()
export class PostService {
  constructor(
    protected postsRepository: PostsSqlRepository,
    protected postsQueryRepository: PostsSqlQueryRepository,
    protected blogsQueryRepository: BlogsSqlQueryRepository,
  ) {}

  async getAllPosts(userId: string, data: SortData) {
    return await this.postsQueryRepository.getAllPosts(data, userId);
  }

  async createPost(data: PostCreateData, userId: string) {
    const createdPost = await this.postsRepository.createPost(data, userId);
    return createdPost;
  }
  async updatePost(
    postId: string,
    data: InputPostCreate,
  ): Promise<boolean | null> {
    return await this.postsRepository.updatePost(postId, data);
  }

  async getPostById(postId: string, userId?: string) {
    return this.postsQueryRepository.getPostById(postId, userId);
  }
  async deletePost(postId: string): Promise<boolean> {
    return await this.postsRepository.deletePost(postId);
  }
}
