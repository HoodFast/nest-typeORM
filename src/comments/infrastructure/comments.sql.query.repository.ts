import { SortData } from '../../base/sortData/sortData.model';
import { Pagination } from '../../base/paginationInputDto/paginationOutput';
import { CommentsOutputType } from '../api/model/output/comments.output';
import { DataSource, Repository } from 'typeorm';
import {
  commentSqlMapper,
  commentSqlOrmMapper,
} from './mappers/comments.sql.mapper';
import { PostsSqlQueryRepository } from '../../posts/infrastructure/posts.sql.query.repository';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Comments } from '../domain/comment.sql.entity';

export class CommentsSqlQueryRepository {
  constructor(
    protected postQueryRepository: PostsSqlQueryRepository,
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Comments)
    protected commentsRepository: Repository<Comments>,
  ) {}
  async getCommentById(
    commentId: string,
    userId?: string,
  ): Promise<CommentsOutputType | null> {
    try {
      const comments: any = await this.commentsRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.commentLikes', 'likes')
        .where(`comment.id = :commentId`, { commentId })
        .getOne();
      if (!comments) return null;

      return commentSqlOrmMapper(comments, userId);
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }

  async getAllByPostId(
    userId: string,
    postId: string,
    sortData: SortData,
  ): Promise<Pagination<CommentsOutputType> | null> {
    try {
      const post = await this.postQueryRepository.getPostById(postId);
      if (!post) return null;
      const { sortBy, sortDirection, pageSize, pageNumber } = sortData;
      const offset = (pageNumber - 1) * pageSize;

      const [comments, totalCount] = await this.commentsRepository.findAndCount(
        {
          relations: ['commentLikes'],
          where: { postId },
          take: pageSize,
          skip: offset,
          order: {
            [sortBy]: sortDirection,
          },
        },
      );

      const pagesCount = Math.ceil(totalCount / pageSize);

      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount: totalCount,
        items: comments.map((i: any) => commentSqlOrmMapper(i, userId)),
      };
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
}
