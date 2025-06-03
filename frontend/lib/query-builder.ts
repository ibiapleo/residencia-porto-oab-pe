import type { PaginationParams } from "@/types/paginacao"

export function buildQuery(params: PaginationParams): string {
  const query = new URLSearchParams()

  // Paginação
  if (params.page !== undefined) query.append("page", String(params.page))
  if (params.size !== undefined) query.append("size", String(params.size))

  // Ordenação
  if (params.sort && params.sort.length > 0) {
    params.sort.forEach(({ field, direction }) => {
      query.append("sort", `${field},${direction}`)
    })
  }

  // Filtros
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return

      // Handle array values (for select filters)
      if (Array.isArray(value)) {
        if (value.length > 0) {
          query.append(key, value.join(","))
        }
        return
      }

      // Handle date range objects
      if (typeof value === "object" && value !== null) {
        if ("from" in value && value.from) {
          query.append(`${key}.from`, String(value.from))
        }
        if ("to" in value && value.to) {
          query.append(`${key}.to`, String(value.to))
        }
        if ("min" in value && value.min !== undefined) {
          query.append(`${key}.min`, String(value.min))
        }
        if ("max" in value && value.max !== undefined) {
          query.append(`${key}.max`, String(value.max))
        }
        return
      }

      // Simple values
      query.append(key, String(value))
    })
  }

  return query.toString()
}
