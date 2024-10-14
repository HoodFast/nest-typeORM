import { Likes, likesStatuses } from '../../posts/domain/post.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export class likesType {
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  likesStatus: likesStatuses;
}

@Schema()
export class CommentatorInfo {
  @Prop()
  userId: string;
  @Prop()
  userLogin: string;
}
export class CommentDbType {
  content: string;

  postId: string;

  commentatorInfo: CommentatorInfo;

  createdAt: string | Date;

  likesCount: number;

  dislikesCount: number;

  likes: Likes[];
}

@Schema()
export class Comment {
  @Prop()
  content: string;
  @Prop()
  postId: string;
  @Prop()
  commentatorInfo: CommentatorInfo;
  @Prop()
  createdAt: string;
  @Prop()
  likesCount: number;
  @Prop()
  dislikesCount: number;
  @Prop({
    default: [],
    type: [Likes],
  })
  likes: Likes[];

  addLike(userId: string, likeStatus: likesStatuses): boolean {
    const likes: likesType[] = this.likes;
    const myStatus = likes.find((i) => i.userId === userId);
    const newLike: likesType = {
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
      likesStatus: likeStatus,
    };
    if (!myStatus) {
      likes.push(newLike);
      this.likesCount = likes.filter(
        (i) => i.likesStatus === likesStatuses.like,
      ).length;
      this.dislikesCount = likes.filter(
        (i) => i.likesStatus === likesStatuses.dislike,
      ).length;
      return true;
    }

    if (myStatus.likesStatus === likeStatus) return true;

    myStatus.likesStatus = likeStatus;
    myStatus.updatedAt = new Date();
    this.likesCount = likes.filter(
      (i) => i.likesStatus === likesStatuses.like,
    ).length;
    this.dislikesCount = likes.filter(
      (i) => i.likesStatus === likesStatuses.dislike,
    ).length;

    return true;
    // if (!myStatus) {
    //   likes.push(newLike);
    // } else {
    //   myStatus.likesStatus = likeStatus;
    //   myStatus.updatedAt = new Date();
    // }
    //
    // this.likesCount = likes.filter(
    //   (i) => i.likesStatus === likesStatuses.like,
    // ).length;
    // this.dislikesCount = likes.filter(
    //   (i) => i.likesStatus === likesStatuses.dislike,
    // ).length;
    //
    // return true;
  }
  getMyStatus(userId: string): likesStatuses {
    const likes: likesType[] = this.likes;
    const myStatus = likes.find((i) => i.userId === userId);

    if (!myStatus) return likesStatuses.none;

    return myStatus.likesStatus;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.methods = {
  addLike: Comment.prototype.addLike,
  getMyStatus: Comment.prototype.getMyStatus,
};

export type CommentDocument = HydratedDocument<Comment>;
