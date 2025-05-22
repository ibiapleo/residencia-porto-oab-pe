// utils/queryBuilder.ts
import { PaginationParams } from '@/types/paginacao';

export function buildQuery(params: PaginationParams): string {
  const query = new URLSearchParams();

  if (params.page !== undefined) query.append('page', String(params.page));
  if (params.size !== undefined) query.append('size', String(params.size));

  if (params.sort) {
    params.sort.forEach(({ field, direction }) => {
      query.append('sort', `${field},${direction}`);
    });
  }

  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        query.append(key, String(value));
      }
    });
  }

  return query.toString();
}
