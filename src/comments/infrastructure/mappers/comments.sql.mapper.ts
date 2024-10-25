import { likesStatuses } from '../../../posts/domain/post.schema';
import { CommentsOutputType } from '../../api/model/output/comments.output';
import { CommentsLikes } from '../../domain/comment.sql.entity';

export const commentSqlMapper = (
  comment: CommentsOutputType & {
    likesCount: string;
    dislikesCount: string;
    userId: string;
    userLogin: string;
    myStatus: likesStatuses;
  },
): CommentsOutputType => {
  return {
    id: comment.id,
    content: comment.content,
    commentatorInfo: {
      userId: comment.userId,
      userLogin: comment.userLogin,
    },
    createdAt: comment.createdAt,
    likesInfo: {
      likesCount: +comment.likesCount,
      dislikesCount: +comment.dislikesCount,
      myStatus: comment.myStatus ?? likesStatuses.none,
    },
  };
};

export const commentSqlOrmMapper = (
  comment: CommentsOutputType & {
    userId: string;
    userLogin: string;
    myStatus: likesStatuses;
    commentLikes: CommentsLikes[];
  },
  userId?: string,
): CommentsOutputType => {
  const likesCount = comment.commentLikes.reduce((acc, j) => {
    if (j.likesStatus === likesStatuses.like) {
      return acc + 1;
    }
  }, 0);
  const dislikesCount = comment.commentLikes.reduce((acc, j) => {
    if (j.likesStatus === likesStatuses.dislike) {
      return acc + 1;
    }
  }, 0);
  let myStatus = likesStatuses.none;
  if (comment.commentLikes) {
    comment.commentLikes.forEach((i) => {
      if (i.userId === userId) {
        myStatus = i.likesStatus;
      }
    });
  }

  return {
    id: comment.id,
    content: comment.content,
    commentatorInfo: {
      userId: comment.userId,
      userLogin: comment.userLogin,
    },
    createdAt: comment.createdAt,
    likesInfo: {
      likesCount: likesCount ?? 0,
      dislikesCount: dislikesCount ?? 0,
      myStatus: myStatus ?? likesStatuses.none,
    },
  };
};
