import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { InputPostCreate } from '../../src/posts/api/input/PostsCreate.dto';

export class PostTestManager {
  constructor(protected readonly app: INestApplication) {}
  async createPost(createPostData: InputPostCreate, expectStatus: number) {
    const response = await request(this.app.getHttpServer())
      .post(`/posts`)
      .auth('admin', 'qwerty')
      .send(createPostData)
      .expect(expectStatus);
    return response;
  }
  async updatePost(
    updatePostData: InputPostCreate,
    postId: string,
    expectStatus: number,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/posts/${postId}`)
      .auth('admin', 'qwerty')
      .send(updatePostData)
      .expect(expectStatus);
    return response;
  }
  async deletePost(id: string) {
    await request(this.app.getHttpServer())
      .delete(`/posts/${id}`)
      .auth('admin', 'qwerty')
      .expect(204);
    return;
  }
  checkPostBody(response: any) {
    const post = response.body;
    expect(post).toEqual({
      id: expect.any(String),
      title: expect.any(String),
      shortDescription: expect.any(String),
      content: expect.any(String),
      blogId: expect.any(String),
      blogName: expect.any(String),
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: expect.any(Number),
        dislikesCount: expect.any(Number),
        myStatus: expect.any(String),
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: expect.any(String),
            login: expect.any(String),
          },
        ],
      },
    });
  }
  checkAllPostsBody(response: any) {
    const blogs = response.body;
    expect(blogs).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: expect.any(Array),
    });
  }
  checkValidateErrors(response: any) {
    const result = response.body;

    expect(result).toEqual({
      errorsMessages: [
        { message: expect.any(String), field: expect.any(String) },
        { message: expect.any(String), field: expect.any(String) },
        { message: expect.any(String), field: expect.any(String) },
      ],
    });
  }
}
