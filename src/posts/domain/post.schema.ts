import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum likesStatuses {
  none = 'None',
  like = 'Like',
  dislike = 'Dislike',
}

@Schema()
export class Likes {
  @Prop({ default: new Date() })
  createdAt: Date;
  @Prop({ default: new Date() })
  updatedAt: Date;
  @Prop()
  login: string;
  @Prop()
  userId: string;
  @Prop({ default: likesStatuses.none })
  likesStatus: likesStatuses;
}
// const likesSchema = SchemaFactory.createForClass(Likes);
@Schema()
export class Post {
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  shortDescription: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  blogId: string;
  @Prop({ required: true })
  blogName: string;
  @Prop({ default: new Date().toISOString() })
  createdAt: string;
  @Prop({ default: 0 })
  likesCount: number;
  @Prop({ default: 0 })
  dislikesCount: number;
  @Prop({
    default: [],
    type: [Likes],
  })
  likes: Likes[];

  addLike(userId: string, likeStatus: likesStatuses, login: string): boolean {
    const likes: Likes[] = this.likes;
    const myStatus = likes.find((i) => i.userId === userId);
    const newLike: Likes = {
      createdAt: new Date(),
      updatedAt: new Date(),
      login,
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
  }
  getMyStatus(userId: string): likesStatuses {
    const myStatus = this.likes.find((i) => i.userId === userId);

    if (!myStatus) return likesStatuses.none;

    return myStatus.likesStatus;
  }
  getNewestLikes(): Likes[] {
    const likes: Likes[] = this.likes.filter(
      (i) => i.likesStatus == likesStatuses.like,
    );
    const sortLikes: Likes[] = likes.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    return sortLikes.slice(0, 3);
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.methods = {
  addLike: Post.prototype.addLike,
  getMyStatus: Post.prototype.getMyStatus,
  getNewestLikes: Post.prototype.getNewestLikes,
};

export type PostDocument = HydratedDocument<Post>;
