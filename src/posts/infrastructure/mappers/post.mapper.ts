import { likesStatuses } from '../../domain/post.schema';
import { Posts } from '../../domain/post.sql.entity';
import { LikePost } from '../../domain/likePost.sql.entity';

export class PostInputType {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
  myStatus: likesStatuses;
  newestLikes: NewestLikesInput[];
}

export class PostType {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date | string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: likesStatuses;
    newestLikes: NewestLikesOutput[];
  };
}
export class NewestLikesInput {
  addedAt: string;
  userId: string;
  login: string;
  postId: string;
}
export class NewestLikesOutput {
  addedAt: Date | string;
  userId: string;
  login: string;
}
export const newestLikesMapper = (
  like: NewestLikesInput,
): NewestLikesOutput => {
  return {
    addedAt: like.addedAt,
    userId: like.userId,
    login: like.login,
  };
};

export const postMapper = (
  post: PostInputType,
  likes: NewestLikesInput[],
): PostType => {
  try {
    const newestLikes = likes
      .filter((i) => i.postId === post.id)
      .sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1))
      .slice(0, 3)
      .map(newestLikesMapper);

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: +post.likesCount,
        dislikesCount: +post.dislikesCount,
        myStatus: post.myStatus ?? likesStatuses.none,
        newestLikes,
      },
    };
  } catch (e) {
    console.log(e);
    throw new Error('post mapper');
  }
};

export const postSqlMapper = (post: Posts, userId?: string): PostType => {
  const x = post.postLikes;
  let likesCount;
  let dislikesCount;
  let newestLikes: NewestLikesOutput[] = [];
  if (post.postLikes) {
    newestLikes = post.postLikes
      .filter(
        (i) => i.postId === post.id && i.likesStatus === likesStatuses.like,
      )
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
      .slice(0, 3)
      .map(newestSqlLikesMapper);
    likesCount = post.postLikes.filter(
      (i) => i.likesStatus === likesStatuses.like,
    ).length;
    dislikesCount = post.postLikes.filter(
      (i) => i.likesStatus === likesStatuses.dislike,
    ).length;
  }

  let myStatus = likesStatuses.none;
  if (userId) {
    const myLikesStatus = post.postLikes.find((i) => i.userId === userId);
    if (myLikesStatus) myStatus = myLikesStatus.likesStatus;
  }
  return {
    id: post.id,
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
    extendedLikesInfo: {
      likesCount: likesCount,
      dislikesCount: dislikesCount,
      myStatus: myStatus,
      newestLikes,
    },
  };
};

export const newestSqlLikesMapper = (like: LikePost): NewestLikesOutput => {
  return {
    addedAt: like.updatedAt,
    userId: like.userId,
    login: like.login,
  };
};
