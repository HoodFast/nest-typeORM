import { Injectable } from '@nestjs/common';
import { likesStatuses } from '../domain/post.schema';
import { InputPostCreate, PostCreateData } from '../api/input/PostsCreate.dto';
import { BlogsSqlQueryRepository } from '../../blogs/infrastructure/blogs.sql.query.repository';
import { PostsSqlQueryRepository } from './posts.sql.query.repository';
import { DataSource, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Posts } from '../domain/post.sql.entity';

@Injectable()
export class PostsSqlRepository {
  constructor(
    protected blogsQueryRepository: BlogsSqlQueryRepository,
    protected postsQueryRepository: PostsSqlQueryRepository,
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Posts) protected postRepository: Repository<Posts>,
  ) {}

  async createPost(data: PostCreateData, userId?: string) {
    try {
      const blog = await this.blogsQueryRepository.getBlogById(data.blogId);
      if (!blog) return null;

      const newPost = new Posts();
      newPost.title = data.title;
      newPost.shortDescription = data.shortDescription;
      newPost.content = data.content;
      newPost.blogId = data.blogId;
      newPost.blogName = blog.name;
      newPost.createdAt = data.createdAt;
      const createdPost = await this.postRepository.save(newPost);
      return await this.postsQueryRepository.getPostById(
        createdPost.id,
        userId,
      );
    } catch (e) {
      console.log(e);
      throw new Error('createPost');
    }
  }
  async updatePost(postId: string, data: InputPostCreate) {
    try {
      const blog = await this.blogsQueryRepository.getBlogById(data.blogId);

      if (!blog) return null;

      const updatedPost: Posts | null = await this.postRepository.findOne({
        where: {
          id: postId,
        },
      });
      if (!updatedPost) return null;
      updatedPost.title = data.title;
      updatedPost.shortDescription = data.shortDescription;
      updatedPost.content = data.content;
      updatedPost.blogId = data.blogId;
      updatedPost.blogName = blog.name;
      const save = await this.postRepository.save(updatedPost);

      return true;
    } catch (e) {
      console.log(e);
      throw new Error('updatePost');
    }
  }
  async deletePost(postId: string): Promise<boolean> {
    try {
      const deleted = await this.postRepository.delete({ id: postId });
      return !!deleted.affected;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
  async getLikeToPostWithUserId(postId: string, userId: string) {
    const res = await this.dataSource.query(
      `
    SELECT *
    FROM public."like_post" p
    WHERE p."postId" = $1 AND p."userId" = $2
    `,
      [postId, userId],
    );
    return res[0];
  }
  async updateLikeToPost(
    userId: string,
    likeStatus: likesStatuses,
    login: string,
    postId: string,
  ): Promise<boolean | null> {
    try {
      const myLike = await this.getLikeToPostWithUserId(postId, userId);
      const likeId = randomUUID();
      const dateNow = new Date();
      if (!myLike) {
        const createdLike = await this.dataSource.query(
          `
        INSERT INTO public."like_post"("id","createdAt","updatedAt","login","likesStatus", "userId","postId")
        VALUES($1,$2,$3,$4,$5,$6,$7)
        `,
          [likeId, dateNow, dateNow, login, likeStatus, userId, postId],
        );
        return true;
      }

      const updatedLikeStatus = await this.dataSource.query(
        `
      UPDATE public."like_post"
      SET "likesStatus" = $1, "updatedAt" = $3 
      WHERE "id" = $2
      `,
        [likeStatus, myLike.id, dateNow],
      );

      return true;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
}
