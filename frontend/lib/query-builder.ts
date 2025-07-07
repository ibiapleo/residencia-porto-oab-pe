import { PaginationParams } from "@/types/paginacao";

// utils/queryBuilder.ts
export function buildQuery(params: PaginationParams ): string {
  const query = new URLSearchParams();

  // Paginação
  if (params.page !== undefined) query.append("page", String(params.page));
  if (params.size !== undefined) query.append("size", String(params.size));

  // Ordenação
  if (params.sort) {
    params.sort.forEach(({ field, direction }) => {
      query.append("sort", `${field},${direction}`);
    });
  }

  // Filtros
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;

      // Valores simples
      query.append(key, String(value));
    });
  }

  return query.toString();
}