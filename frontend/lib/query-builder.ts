// utils/queryBuilder.ts
import { PaginationParams } from '@/types/paginacao';



export function buildQuery(params: PaginationParams): string {
  const query = new URLSearchParams();

  if (params.page !== undefined) query.append("page", String(params.page));
  if (params.size !== undefined) query.append("size", String(params.size));

  if (params.sort) {
    params.sort.forEach(({ field, direction }) => {
      query.append("sort", `${field},${direction}`);
    });
  }

  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;

      if (
        typeof value === "object" &&
        "from" in value &&
        "to" in value
      ) {
        if (value.from) query.append(`${key}.from`, value.from);
        if (value.to) query.append(`${key}.to`, value.to);
      } else {
        query.append(key, String(value));
      }
    });
  }

  return query.toString();
}

