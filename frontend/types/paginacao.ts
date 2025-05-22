// types/pagination.ts
export type SortDirection = 'asc' | 'desc';

export type Sort = {
  field: string;
  direction: SortDirection;
};

export type PaginationParams = {
  page?: number;
  size?: number;
  sort?: Sort[];
  filters?: Record<string, string | number | boolean | null | undefined>;
};

export type Page<T> = {
  content: T[];
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
};
