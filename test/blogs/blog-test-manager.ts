import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createBlogInputDto } from '../../src/blogs/api/model/input/create-blog-input-dto';
import { PostInput } from '../../src/posts/api/input/PostsCreate.dto';

export class BlogTestManager {
  constructor(protected readonly app: INestApplication) {}

  async createBlog(createBlogData: createBlogInputDto, expectStatus: number) {
    const response = await request(this.app.getHttpServer())
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send(createBlogData)
      .expect(expectStatus);
    return response;
  }
  async createPostForBlog(
    createPostData: PostInput,
    blogId: string,
    expectStatus: number,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/blogs/${blogId}/posts`)
      .auth('admin', 'qwerty')
      .send(createPostData)
      .expect(expectStatus);
    return response;
  }
  async updateBlog(
    updateBlogData: createBlogInputDto,
    blogId: string,
    expectStatus: number,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/blogs/${blogId}`)
      .auth('admin', 'qwerty')
      .send(updateBlogData)
      .expect(expectStatus);
    return response;
  }
  async deleteBlog(uri: string) {
    await request(this.app.getHttpServer())
      .delete(uri)
      .auth('admin', 'qwerty')
      .expect(204);
    return;
  }
  checkBlogBody(response: any) {
    const blog = response.body;
    expect(blog).toEqual({
      id: expect.any(String),
      name: expect.any(String),
      description: expect.any(String),
      websiteUrl: expect.any(String),
      createdAt: expect.any(String),
      isMembership: expect.any(Boolean),
    });
  }
  checkAllBlogsBody(response: any) {
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
