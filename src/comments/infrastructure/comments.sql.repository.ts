import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDbType,
  CommentDocument,
} from '../domain/comment.schema';
import { Model } from 'mongoose';
import { CommentsOutputType } from '../api/model/output/comments.output';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { CommentsSqlQueryRepository } from './comments.sql.query.repository';
import { UsersSqlQueryRepository } from '../../users/infrastructure/users.sql.query.repository';
import { Comments } from '../domain/comment.sql.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentsSqlRepository {
  constructor(
    private commentsQueryRepository: CommentsSqlQueryRepository,
    private usersQueryRepository: UsersSqlQueryRepository,
    private dataSource: DataSource,
    @InjectRepository(Comments)
    protected commentsRepository: Repository<Comments>,
  ) {}
  async createComment(
    createData: CommentDbType,
  ): Promise<CommentsOutputType | null> {
    try {
      const newComment = new Comments();
      newComment.content = createData.content;
      newComment.createdAt = new Date(createData.createdAt);
      newComment.userId = createData.commentatorInfo.userId;
      newComment.postId = createData.postId;
      newComment.userLogin = createData.commentatorInfo.userLogin;

      const save = await this.commentsRepository.save(newComment);
      const comment = await this.commentsQueryRepository.getCommentById(
        save.id,
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
    const comment = await this.commentsRepository.findOne({ where: { id } });
    if (!comment) return false;
    comment.content = content;
    const save = await this.commentsRepository.save(comment);

    return !!save;
  }

  async deleteById(id: string): Promise<boolean> {
    const deleted = await this.commentsRepository.delete({ id });
    return !!deleted.affected;
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
