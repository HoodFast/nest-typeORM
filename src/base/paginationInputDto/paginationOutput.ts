export type Pagination<I> = {
  totalCount: number;
  pagesCount: number;
  page: number;
  pageSize: number;
  items: I[];
};
