import { blogsDto, postsDto, usersDto } from '../dtos/test.dto';
import { TestManager } from '../testManager';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSettings } from '../../src/settings/app.settings';
import request from 'supertest';
import { BlogTestManager } from '../blogs/blog-test-manager';
import { PostTestManager } from './post-test-manager';
import { UserTestManager } from '../users/user.test.manager';
import { randomUUID } from 'crypto';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let httpServer;
  let blogTestManager;
  let postTestManager;
  let createdBlogRes;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSettings(app);
    await app.init();
    httpServer = app.getHttpServer();
    blogTestManager = new BlogTestManager(app);
    postTestManager = new PostTestManager(app);
  });
  beforeEach(async () => {
    createdBlogRes = await blogTestManager.createBlog(
      blogsDto.createBlogData,
      201,
    );
  });
  afterAll(async () => {
    const testManager = new TestManager(app);
    await testManager.deleteAll();
  });
  afterEach(async () => {
    const testManager = new TestManager(app);
    await testManager.deleteAll();
  });
  expect.setState({
    createPostData: postsDto.createPostData,
    updatePostData: postsDto.updatePostData,
    createWrongPostData: postsDto.createWrongPostData,
    createBlogData: blogsDto.createBlogData,
    createUserData: usersDto.createUserData,
  });

  it('create post with correct data', async () => {
    const { createPostData } = expect.getState();

    const response = await postTestManager.createPost(
      { ...createPostData, blogId: createdBlogRes.body.id },
      201,
    );
    return response;
  });

  it('post don`t create, validation error status 400', async () => {
    const { createWrongPostData } = expect.getState();

    const badResponse = await blogTestManager.createBlog(
      { ...createWrongPostData, blogId: createdBlogRes.body.id },
      400,
    );

    blogTestManager.checkValidateErrors(badResponse);
  });
  it('post don`t create, validation error status 400 blog don`t exist', async () => {
    const { createPostData } = expect.getState();
    await blogTestManager.deleteBlog(`/blogs/${createdBlogRes.body.id}`);
    await postTestManager.createPost(
      { ...createPostData, blogId: createdBlogRes.body.id },
      400,
    );
  });
  it('post don`t create because unauthorised, status 401', async () => {
    const response = await request(httpServer)
      .post('/posts')
      .send({})
      .expect(401);
    return response;
  });

  it('update post ', async () => {
    const { createPostData, updatePostData } = expect.getState();

    const post = await postTestManager.createPost(
      { ...createPostData, blogId: createdBlogRes.body.id },
      201,
    );

    await postTestManager.updatePost(
      { ...updatePostData, blogId: createdBlogRes.body.id },
      post.body.id,
      204,
    );

    const updatedPost = await request(httpServer).get(`/blogs/${post.body.id}`);
    expect(updatedPost.body.name).toBe(updatePostData.name);
  });
  it('delete post ', async () => {
    const { createPostData } = expect.getState();
    const post = await postTestManager.createPost(
      { ...createPostData, blogId: createdBlogRes.body.id },
      201,
    );

    await request(httpServer).get(`/posts/${post.body.id}`).expect(200);
    await postTestManager.deletePost(post.body.id);
    const deletedPost = await request(httpServer).get(`/posts/${post.body.id}`);
    expect(deletedPost.statusCode).toBe(404);
  });
  it('don`t delete post because Unauthorized', async () => {
    const { createPostData } = expect.getState();
    const post = await postTestManager.createPost(
      { ...createPostData, blogId: createdBlogRes.body.id },
      201,
    );

    await request(httpServer).delete(`/posts/${post.body.id}`).expect(401);
  });
  it('get post by id and add likes status check', async () => {
    const { createPostData } = expect.getState();
    const post = await postTestManager.createPost(
      { ...createPostData, blogId: createdBlogRes.body.id },
      201,
    );
    await request(httpServer).get(`/posts/${post.body.id}`).expect(200);
    const userTestManager = new UserTestManager(app);
    const random = randomUUID();
    const createUserData = {
      login: `user ${random.substring(0, 3)}`,
      password: `${random.substring(0, 6)}`,
      email: `usermail${random}@mail.ru`,
    };
    await userTestManager.createUser(createUserData, 201);
    const userResponse = await request(httpServer)
      .post('/auth/login')
      .send({
        loginOrEmail: createUserData.login,
        password: createUserData.password,
      })
      .expect(200);

    const accessToken = userResponse.body.accessToken;
    await request(httpServer)
      .put(`/posts/${post.body.id}/like-status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        likeStatus: 'Like',
      });
    const postWithLikes = await request(httpServer)
      .get(`/posts/${post.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await postTestManager.checkPostBody(postWithLikes);
  });
  it('get post by id and add Dislike status check', async () => {
    const { createPostData } = expect.getState();
    const post = await postTestManager.createPost(
      { ...createPostData, blogId: createdBlogRes.body.id },
      201,
    );
    await request(httpServer).get(`/posts/${post.body.id}`).expect(200);
    const userTestManager = new UserTestManager(app);
    const random = randomUUID();
    const createUserData = {
      login: `user ${random.substring(0, 3)}`,
      password: `${random.substring(0, 6)}`,
      email: `usermail${random}@mail.ru`,
    };
    await userTestManager.createUser(createUserData, 201);
    const userResponse = await request(httpServer)
      .post('/auth/login')
      .send({
        loginOrEmail: createUserData.login,
        password: createUserData.password,
      })
      .expect(200);

    const accessToken = userResponse.body.accessToken;
    await request(httpServer)
      .put(`/posts/${post.body.id}/like-status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        likeStatus: 'Like',
      });
    await request(httpServer)
      .put(`/posts/${post.body.id}/like-status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        likeStatus: 'Dislike',
      });
    const postWithDislike = await request(httpServer)
      .get(`/posts/${post.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(postWithDislike.body.extendedLikesInfo.myStatus).toBe('Dislike');
  });
  it('get all posts by id', async () => {
    const { createPostData } = expect.getState();
    for (let i = 0; i < 4; i++) {
      await postTestManager.createPost(
        { ...createPostData, blogId: createdBlogRes.body.id },
        201,
      );
    }
    const res = await request(httpServer).get(`/posts`).expect(200);
    await postTestManager.checkAllPostsBody(res);
  });
});
