import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDbType,
  CommentDocument,
} from '../domain/comment.schema';
import { Model } from 'mongoose';
import { CommentsOutputType } from '../api/model/output/comments.output';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { CommentsSqlQueryRepository } from './comments.sql.query.repository';
import { UsersSqlQueryRepository } from '../../users/infrastructure/users.sql.query.repository';

@Injectable()
export class CommentsSqlRepository {
  constructor(
    private commentsQueryRepository: CommentsSqlQueryRepository,
    private usersQueryRepository: UsersSqlQueryRepository,
    private dataSource: DataSource,
  ) {}
  async createComment(
    createData: CommentDbType,
  ): Promise<CommentsOutputType | null> {
    try {
      const commentsId = randomUUID();
      const res = await this.dataSource.query(
        `
    INSERT INTO public."comments"(
    "id","content","createdAt","userId","postId","userLogin"
    )
    VALUES($1,$2,$3,$4,$5,$6)
    `,
        [
          commentsId,
          createData.content,
          createData.createdAt,
          createData.commentatorInfo.userId,
          createData.postId,
          createData.commentatorInfo.userLogin,
        ],
      );
      const comment = await this.commentsQueryRepository.getCommentById(
        commentsId,
        createData.commentatorInfo.userId,
      );
      if (!comment) {
        return null;
      }
      return comment;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }

  async updateComment(id: string, content: string): Promise<boolean> {
    const res = await this.dataSource.query(
      `
    UPDATE public."comments" c
    SET "content" = $1
    WHERE c."id" = $2
    `,
      [content, id],
    );
    return !!res[1];
  }

  async deleteById(id: string): Promise<boolean> {
    const res = await this.dataSource.query(
      `
    DELETE FROM public."comments" c
    WHERE c."id" = $1
    `,
      [id],
    );
    return !!res[0];
  }
  async addLikeToComment(
    userId: string,
    commentId: string,
    likeStatus: string,
  ) {
    try {
      const user = await this.usersQueryRepository.getUserById(userId);
      if (!user) return null;
      const myLikeId = await this.dataSource.query(
        `
    SELECT "id"
    FROM public."comments_likes" p
    WHERE p."userId" = $1 AND p."commentId" = $2
    `,
        [userId, commentId],
      );
      const likeId = randomUUID();
      const dateNow = new Date();
      if (!myLikeId[0]) {
        const createdLike = await this.dataSource.query(
          `
        INSERT INTO public."comments_likes"("id","likesStatus","createdAt","updatedAt","commentId","userId")
        VALUES($1,$2,$3,$4,$5,$6)
        `,
          [likeId, likeStatus, dateNow, dateNow, commentId, userId],
        );
        return true;
      }
      const updatedLike = await this.dataSource.query(
        `
      UPDATE public."comments_likes"
      SET "likesStatus" = $1, "updatedAt" = $2 
      WHERE "id" = $3
`,
        [likeStatus, dateNow, myLikeId[0].id],
      );
      return true;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }
}
