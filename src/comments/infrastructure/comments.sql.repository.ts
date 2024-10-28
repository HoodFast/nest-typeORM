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
import { Comments, CommentsLikes } from '../domain/comment.sql.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { likesStatuses } from '../../posts/domain/likes.statuses';

@Injectable()
export class CommentsSqlRepository {
  constructor(
    private commentsQueryRepository: CommentsSqlQueryRepository,
    private usersQueryRepository: UsersSqlQueryRepository,
    private dataSource: DataSource,
    @InjectRepository(Comments)
    protected commentsRepository: Repository<Comments>,
    @InjectRepository(CommentsLikes)
    protected commentsLikeRepository: Repository<CommentsLikes>,
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
    likeStatus: likesStatuses,
  ): Promise<boolean> {
    try {
      const user = await this.usersQueryRepository.getUserById(userId);
      if (!user) return false;

      const myLike = await this.commentsLikeRepository.findOne({
        where: {
          commentId,
          userId,
        },
      });

      const dateNow = new Date();
      if (!myLike) {
        const newLikeToComment = new CommentsLikes();
        newLikeToComment.likesStatus = likeStatus;
        newLikeToComment.createdAt = dateNow;
        newLikeToComment.updatedAt = dateNow;
        newLikeToComment.commentId = commentId;
        newLikeToComment.userId = userId;
        await this.commentsLikeRepository.save(newLikeToComment);
        return true;
      }

      myLike.likesStatus = likeStatus;
      myLike.updatedAt = dateNow;
      await this.commentsLikeRepository.save(myLike);
      return true;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }
}
