// types/pagination.ts
export type SortDirection = 'asc' | 'desc';

export type Sort = {
  field: string;
  direction: SortDirection;
};

// types/paginacao.ts

export type DateRange = {
  from?: string;
  to?: string;
};

export type FilterValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | DateRange;

export type PaginationParams = {
  page?: number;
  size?: number;
  sort?: Sort[];
  filters?: Record<string, FilterValue>;
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
