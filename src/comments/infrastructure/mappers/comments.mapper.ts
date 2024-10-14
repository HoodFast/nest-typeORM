import { CommentDocument } from '../../domain/comment.schema';
import { likesStatuses } from '../../../posts/domain/post.schema';
import { CommentsOutputType } from '../../api/model/output/comments.output';

export const commentMapper = (
  userId: string | null,
  comment: CommentDocument,
): CommentsOutputType => {
  let myStatus = likesStatuses.none;
  if (userId) {
    myStatus = comment.getMyStatus(userId);
  }

  return {
    id: comment._id.toString(),
    content: comment.content,
    commentatorInfo: {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    },
    createdAt: comment.createdAt,
    likesInfo: {
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
      myStatus: myStatus,
    },
  };
};
