import { likesStatuses } from '../../domain/post.schema';

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
  createdAt: string;
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
  addedAt: string;
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
