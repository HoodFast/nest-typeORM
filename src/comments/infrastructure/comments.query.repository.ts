import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../domain/comment.schema';
import { ObjectId } from 'mongodb';
import { commentMapper } from './mappers/comments.mapper';
import { SortData } from '../../base/sortData/sortData.model';
import { Pagination } from '../../base/paginationInputDto/paginationOutput';
import { CommentsOutputType } from '../api/model/output/comments.output';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';

export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    protected postQueryRepository: PostsQueryRepository,
  ) {}
  async getCommentById(commentsId: string, userId: string = '') {
    const comment = await this.commentModel.find({
      _id: new ObjectId(commentsId),
    });

    if (comment.length === 0) return null;
    return commentMapper(userId, comment[0]);
  }
  async getDBCommentById(commentsId: string) {
    const comment = await this.commentModel.findOne({
      _id: new ObjectId(commentsId),
    });
    return comment;
  }
  async getAllByPostId(
    userId: string,
    postId: string,
    sortData: SortData,
  ): Promise<Pagination<CommentsOutputType> | null> {
    const post = await this.postQueryRepository.getPostById(postId);
    if (!post) return null;
    const { sortBy, sortDirection, pageSize, pageNumber } = sortData;
    const mySortDirection = sortDirection == 'ASC' ? 1 : -1;
    const comments = await this.commentModel
      .find({ postId: postId })
      .sort({ [sortBy]: mySortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const totalCount = await this.commentModel.countDocuments({
      postId: postId,
    });
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: comments.map((i) => commentMapper(userId, i)),
    };
  }
}
