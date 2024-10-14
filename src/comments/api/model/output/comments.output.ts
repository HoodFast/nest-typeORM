import { likesStatuses } from '../../../../posts/domain/post.schema';

export class CommentsOutputType {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: likesStatuses;
  };
}
