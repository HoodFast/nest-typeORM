export const usersDto = {
  createUserData: {
    login: 'lg-332252',
    password: '"qwerty1"',
    email: '6Ya0V21@raLn.Je',
  },
  createWrongUserData: {
    login: 'Fj',
    password: 'string',
    email: '6Ya0V21raLn.Je',
  },
  emailResendingWrong: '1234',
};

export const blogsDto = {
  createBlogData: {
    name: 'string',
    description: 'string',
    websiteUrl:
      'https://3Fc-qMmgZwoZ.RCJZ23z_pATmcGb7GjB8Z5VDo0Kt.kw1.6rr4O8wlbLO7HqvJppv0EBMkEqdQ0.sZGlye6dAu6FG9Ed',
  },
  createWrongBlogData: {
    name: '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16',
    description: 111,
    websiteUrl: 'h',
  },
};

export const postsDto = {
  createPostData: {
    shortDescription: 'test',
    content: 'test',
    title: 'test',
  },
  updatePostData: {
    shortDescription: 'new name',
    content: 'new content',
    title: 'new test test',
  },
  createWrongPostData: {
    shortDescription:
      'test11111111111111111111111111111111111111111111111111' +
      '11111111111111111111111111111111111111111111111111111111111111111111' +
      ' 11111111111111111111111111111111111111111111111111' +
      ' 111111111111111111111111',
    content: 111,
    title: 111,
  },
};

export const errors = {
  errorsMessages: [{ message: '123', field: '123' }],
};
