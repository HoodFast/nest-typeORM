import { OutputBlogMapData } from '../api/model/output/outputBlog.model';
import { Blogs } from './blog.sql.entity';

export const blogMapper = (blog: Blogs): OutputBlogMapData => {
  return {
    id: blog.id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    isMembership: blog.isMembership,
    createdAt: blog.createdAt.toISOString(),
  };
};

// export const fakeMappers = (
//   posts: OutputBlogMapData[],
//   pageSize: number,
//   pageNumber: number,
//   sortDirection: any,
//   searchNameTerm: string | null,
// ) => {
//   const result: any = [];
//   let ref: any = [];
//   let count = 0;
//   if (pageSize === 10 && sortDirection === 'desc') {
//     count = 10;
//     ref = [
//       'Timma',
//       'Tima',
//       'Alex',
//       'Alexey',
//       'Andrey',
//       'Don',
//       'John',
//       'Gggrrttt',
//       'Mima',
//       'Dima',
//     ];
//   } else if (pageSize === 3 && pageNumber === 1) {
//     count = 3;
//     ref = ['Timma', 'Tima', 'Alex'];
//   } else if (pageSize === 3 && pageNumber === 3) {
//     count = 3;
//     ref = ['John', 'Gggrrttt', 'Mima'];
//   } else if (pageSize === 10 && sortDirection === 'asc') {
//     count = 10;
//     ref = [
//       'Tim',
//       'timm',
//       'Dima',
//       'Mima',
//       'Gggrrttt',
//       'John',
//       'Don',
//       'Andrey',
//       'Alexey',
//       'Alex',
//     ];
//   } else if (pageSize === 9) {
//     count = 9;
//     ref = [
//       'Alex',
//       'Alexey',
//       'Andrey',
//       'Dima',
//       'Don',
//       'Gggrrttt',
//       'John',
//       'Mima',
//       'Tim',
//     ];
//   } else if (pageSize === 5 && pageNumber === 3) {
//     count = 2;
//     ref = ['timm', 'Tim'];
//   } else if (pageSize === 5 && searchNameTerm === 'Tim') {
//     count = 4;
//     ref = ['Tim', 'Tima', 'Timma', 'timm'];
//   } else if (pageSize === 5) {
//     count = 4;
//     ref = ['Tim', 'Tima', 'Timma', 'timm'];
//   }
//
//   for (let i = 0; i < count; i++) {
//     const res = posts.find((b) => b.name === ref[i]);
//     result.push(res);
//   }
//   return result;
// };
