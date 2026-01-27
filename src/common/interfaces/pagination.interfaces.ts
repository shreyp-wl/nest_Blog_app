export interface paginationMeta<T> {
  data: T[];
  meta: {
    totalItems: number;
    itemsCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface paginationParams<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}
export interface paginationInput {
  page: number;
  limit: number;
  isPagination: boolean;
}
