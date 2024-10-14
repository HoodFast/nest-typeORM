import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { likesStatuses, Post, PostDocument } from '../domain/post.schema';
import { Model } from 'mongoose';
import { InputPostCreate, PostCreateData } from '../api/input/PostsCreate.dto';
import { BlogsSqlQueryRepository } from '../../blogs/infrastructure/blogs.sql.query.repository';
import { PostsSqlQueryRepository } from './posts.sql.query.repository';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class PostsSqlRepository {
  constructor(
    protected blogsQueryRepository: BlogsSqlQueryRepository,
    protected postsQueryRepository: PostsSqlQueryRepository,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async createPost(data: PostCreateData, userId?: string) {
    try {
      const blog = await this.blogsQueryRepository.getBlogById(data.blogId);
      if (!blog) return null;
      const postId = randomUUID();
      const create = await this.dataSource.query(
        `
            INSERT INTO public."posts"("id","title","shortDescription","content","blogId","blogName","createdAt")
            VALUES($1,$2,$3,$4,$5,$6,$7)
            `,
        [
          postId,
          data.title,
          data.shortDescription,
          data.content,
          data.blogId,
          blog.name,
          data.createdAt,
        ],
      );
      return await this.postsQueryRepository.getPostById(postId, userId);
    } catch (e) {
      console.log(e);
      throw new Error('createPost');
    }
  }
  async updatePost(postId: string, data: InputPostCreate) {
    try {
      const blog = await this.blogsQueryRepository.getBlogById(data.blogId);

      if (!blog) return null;

      const updatePost = await this.dataSource.query(
        `
    UPDATE public."posts"
    SET "title"=$1, "shortDescription" = $2, "content" = $3, "blogId" = $4, "blogName"=$5
    WHERE posts."id" =$6
    `,
        [
          data.title,
          data.shortDescription,
          data.content,
          data.blogId,
          blog.name,
          postId,
        ],
      );
      if (!updatePost[1]) return null;
      return true;
    } catch (e) {
      console.log(e);
      throw new Error('updatePost');
    }
  }
  // async getPostById(id: string) {
  //   const post = await this.postModel.findOne({ _id: id });
  //   return post;
  // }
  async deletePost(postId: string): Promise<boolean> {
    try {
      await this.dataSource.query(
        `
        DELETE FROM public."posts"
        WHERE posts."id" = $1
    `,
        [postId],
      );
      return true;
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
