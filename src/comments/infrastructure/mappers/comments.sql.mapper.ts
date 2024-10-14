import { likesStatuses } from '../../../posts/domain/post.schema';
import { CommentsOutputType } from '../../api/model/output/comments.output';

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
