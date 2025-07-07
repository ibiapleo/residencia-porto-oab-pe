"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Search,
  X,
  Filter,
  ArrowUp,
  ArrowDown,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import TableSkeleton from "@/components/ui/table-skeleton";
import { PaginationParams } from "@/types/paginacao";
import { buildQuery } from "@/lib/query-builder";

// ========== TYPES ==========
export type SortDirection = "asc" | "desc";

export type ColumnFilter = {
  type: "text" | "select" | "date" | "dateRange" | "number" | "boolean";
  options?: { label: string; value: string }[];
  placeholder?: string;
};

export type PaginationState = {
  page: number;
  pageSize: number;
};

export type ColumnDef<TData> = {
  accessorKey: keyof TData | string;
  header: string;
  cell?: (info: {
    row: TData;
    getValue: () => any;
    value: any;
  }) => React.ReactNode;
  enableSorting?: boolean | string[]; // Pode ser boolean ou array de campos permitidos
  enableFiltering?: boolean;
  filter?: ColumnFilter;
  meta?: {
    className?: string;
  };
};

export type SortingState = {
  column: string;
  direction: SortDirection;
} | null;

export type FilterState = {
  [key: string]: any;
};

interface DataTableProps<TData extends Record<string, any>> {
  loading: boolean;
  columns: ColumnDef<TData>[];
  data: TData[] | { content: TData[]; [key: string]: any }; // Aceita array direto ou objeto com content
  searchPlaceholder?: string;
  pageSizeOptions?: number[];
  onRowClick?: (row: TData) => void;
  className?: string;
  enablePagination?: boolean;
  enableServerSidePagination?: boolean;
  totalCount?: number;
  controlledPaginationState?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortChange?: (
    sorting: { field: string; direction: "asc" | "desc" }[]
  ) => void;
  onFilterChange?: (filters: FilterState) => void;
  refetch?: () => void; // Adicione esta prop
}

// ========== UTILS ==========
const applyTextFilter = (value: any, filterValue: string): boolean => {
  if (value === null || value === undefined) return false;
  return String(value).toLowerCase().includes(filterValue.toLowerCase());
};

const applySelectFilter = (value: any, filterValue: string[]): boolean => {
  if (!filterValue?.length) return true;
  return filterValue.includes(String(value));
};

const applyDateFilter = (
  value: any,
  filterValue: Date | [Date?, Date?]
): boolean => {
  if (!value) return false;

  // Properly parse the date value
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return false; // Invalid date

  if (Array.isArray(filterValue)) {
    const [start, end] = filterValue || [undefined, undefined];
    if (!start && !end) return true;

    if (start && end) return date >= start && date <= end;
    if (start) return date >= start;
    if (end) return date <= end;
  } else {
    if (!filterValue) return true;
    return date.toDateString() === filterValue.toDateString();
  }

  return true;
};

const applyNumberFilter = (
  value: any,
  filterValue: { min?: number; max?: number }
): boolean => {
  const numValue = Number(value);
  if (isNaN(numValue)) return false;

  const { min, max } = filterValue || {};

  if (min !== undefined && max !== undefined) {
    return numValue >= min && numValue <= max;
  }
  if (min !== undefined) {
    return numValue >= min;
  }
  if (max !== undefined) {
    return numValue <= max;
  }

  return true;
};

const applyBooleanFilter = (value: any, filterValue: boolean): boolean => {
  if (filterValue === undefined || filterValue === null) return true;
  return Boolean(value) === filterValue;
};

// ========== COMPONENT ==========
export function DataTable<TData extends Record<string, any>>({
  loading,
  columns,
  data = [],
  searchPlaceholder = "Buscar...",
  pageSizeOptions = [10, 20, 50, 100],
  onRowClick,
  className,
  enablePagination = true,
  enableServerSidePagination = false,
  totalCount,
  controlledPaginationState,
  onPaginationChange,
  onSortChange,
  onFilterChange,
  refetch,
}: DataTableProps<TData>) {
  // ========== STATE ==========
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<
    { column: string; direction: "asc" | "desc" }[]
  >([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // ========== MEMOIZED VALUES ==========
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    {
      page: 0,
      pageSize: pageSizeOptions[0],
    }
  );

  const effectivePagination = controlledPaginationState || internalPagination;

  // Dentro do componente DataTable, antes do return
  const buildQueryString = useCallback(() => {
    const params: PaginationParams = {
      page: effectivePagination.page,
      size: effectivePagination.pageSize,
      sort: sorting.map((s) => ({ field: s.column, direction: s.direction })),
      filters: {},
    };

    // Processa os filtros para o formato correto
    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;

      if (typeof value === "object" && "from" in value && "to" in value) {
        // Filtro de intervalo de datas
        params.filters![`${key}.from`] = value.from
          ? format(new Date(value.from), "yyyy-MM-dd")
          : undefined;
        params.filters![`${key}.to`] = value.to
          ? format(new Date(value.to), "yyyy-MM-dd")
          : undefined;
      } else if (value instanceof Date) {
        // Filtro de data única
        params.filters![key] = format(value, "yyyy-MM-dd");
      } else {
        // Outros tipos de filtro
        params.filters![key] = value;
      }
    });

    // Remove filtros vazios
    Object.keys(params.filters!).forEach((key) => {
      if (params.filters![key] === undefined) {
        delete params.filters![key];
      }
    });

    return buildQuery(params);
  }, [effectivePagination, sorting, filters]);

  const filteredData = useMemo(() => {
    const items = Array.isArray(data)
      ? data
      : (data as { content?: TData[] })?.content || [];

    if (enableServerSidePagination) return items;

    return items.filter((item) => {
      if (
        searchTerm &&
        !Object.values(item).some((value) => applyTextFilter(value, searchTerm))
      ) {
        return false;
      }

      for (const [columnKey, filterValue] of Object.entries(filters)) {
        if (
          filterValue === undefined ||
          filterValue === null ||
          filterValue === ""
        )
          continue;

        const column = columns.find((c) => c.accessorKey === columnKey);
        if (!column || !column.enableFiltering) continue;

        const value = item[columnKey];

        switch (column.filter?.type) {
          case "select":
            if (!applySelectFilter(value, filterValue)) return false;
            break;
          case "date":
            if (!applyDateFilter(value, filterValue)) return false;
            break;
          case "dateRange":
            if (!applyDateFilter(value, filterValue)) return false;
            break;
          case "number":
            if (!applyNumberFilter(value, filterValue)) return false;
            break;
          case "boolean":
            if (!applyBooleanFilter(value, filterValue)) return false;
            break;
          default:
            if (!applyTextFilter(value, filterValue)) return false;
        }
      }

      return true;
    });
  }, [data, searchTerm, filters, columns, enableServerSidePagination]);

  const sortedData = useMemo(() => {
    if (!sorting.length || enableServerSidePagination) return filteredData;

    return [...filteredData].sort((a, b) => {
      for (const sortItem of sorting) {
        const aValue = a[sortItem.column];
        const bValue = b[sortItem.column];

        if (aValue === null || aValue === undefined)
          return sortItem.direction === "asc" ? -1 : 1;
        if (bValue === null || bValue === undefined)
          return sortItem.direction === "asc" ? 1 : -1;

        if (aValue instanceof Date && bValue instanceof Date) {
          const result =
            sortItem.direction === "asc"
              ? aValue.getTime() - bValue.getTime()
              : bValue.getTime() - aValue.getTime();
          if (result !== 0) return result;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          const result =
            sortItem.direction === "asc"
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          if (result !== 0) return result;
        }

        if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
          const result =
            sortItem.direction === "asc"
              ? Number(aValue) - Number(bValue)
              : Number(bValue) - Number(aValue);
          if (result !== 0) return result;
        }
      }

      return 0;
    });
  }, [filteredData, sorting, enableServerSidePagination]);

  const paginatedData = useMemo(() => {
    if (enableServerSidePagination) {
      return Array.isArray(data)
        ? data
        : (data as { content?: TData[] })?.content || [];
    }

    const start = effectivePagination.page * effectivePagination.pageSize;
    const end = start + effectivePagination.pageSize;
    return sortedData.slice(start, end);
  }, [
    data,
    sortedData,
    effectivePagination.page,
    effectivePagination.pageSize,
    enableServerSidePagination,
  ]);

  const totalPages = useMemo(() => {
    if (enableServerSidePagination && totalCount !== undefined) {
      return Math.max(1, Math.ceil(totalCount / effectivePagination.pageSize));
    }
    return Math.max(
      1,
      Math.ceil(filteredData.length / effectivePagination.pageSize)
    );
  }, [
    filteredData.length,
    effectivePagination.pageSize,
    enableServerSidePagination,
    totalCount,
  ]);

  const totalItems = useMemo(() => {
    if (enableServerSidePagination && totalCount !== undefined) {
      return totalCount;
    }
    return filteredData.length;
  }, [filteredData.length, enableServerSidePagination, totalCount]);

  // ========== EFFECTS ==========
  // Atualize o useEffect que reseta a página
  useEffect(() => {
    if (enableServerSidePagination) {
      const query = buildQueryString();
      refetch?.();
    }
  }, [enableServerSidePagination, onPaginationChange, refetch]);

  useEffect(() => {
    const active = Object.entries(filters)
      .filter(([_, value]) => {
        if (value === undefined || value === null || value === "") return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === "object" && !Array.isArray(value)) {
          return Object.values(value).some(
            (v) => v !== undefined && v !== null && v !== ""
          );
        }
        return true;
      })
      .map(([key]) => key);

    setActiveFilters(active);
  }, [filters]);

  useEffect(() => {
    onPaginationChange?.(effectivePagination);
    refetch?.();
  }, [effectivePagination, onPaginationChange]);

  useEffect(() => {
    const mappedSorting = sorting.map((s) => ({
      field: s.column,
      direction: s.direction,
    }));

    onSortChange?.(mappedSorting);
    refetch?.();
  }, [sorting, onSortChange]);

  useEffect(() => {
    onFilterChange?.(filters);
    refetch?.();
  }, [filters, onFilterChange]);

  // ========== HANDLERS ==========
  const handleSort = useCallback(
    (columnKey: string) => {
      const columnDef = columns.find((c) => c.accessorKey === columnKey);
      if (!columnDef || columnDef.enableSorting === false) return;

      setSorting((prev) => {
        const existing = prev.find((s) => s.column === columnKey);

        if (existing) {
          // Alternar asc -> desc -> remover
          if (existing.direction === "asc") {
            return prev.map((s) =>
              s.column === columnKey ? { ...s, direction: "desc" } : s
            );
          } else {
            return prev.filter((s) => s.column !== columnKey); // remove
          }
        } else {
          return [...prev, { column: columnKey, direction: "asc" }];
        }
      });
    },
    [columns]
  );

  const handleFilter = useCallback((column: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value === "" ? undefined : value,
    }));
  }, []);

  const clearFilter = useCallback((column: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
    setSearchTerm("");
    setShowAdvancedFilters(false);
  }, []);

  const handlePageChange = (newPage: number) => {
    const newPagination = {
      ...effectivePagination,
      page: newPage,
    };

    if (onPaginationChange) {
      onPaginationChange(newPagination);
    } else {
      setInternalPagination(newPagination);
    }

    // Forçar atualização imediatamente
    if (!enableServerSidePagination) {
      // Atualização do lado do cliente já é feita pelo useMemo
    } else {
      refetch?.();
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    const newPagination = {
      page: 0,
      pageSize: newSize,
    };

    if (onPaginationChange) {
      onPaginationChange(newPagination);
    } else {
      setInternalPagination(newPagination);
    }
  };

  const renderFilterInput = (column: ColumnDef<TData>) => {
    const accessorKey = String(column.accessorKey);
    const currentValue = filters[accessorKey];
    const filterType = column.filter?.type || "text";

    switch (filterType) {
      case "select":
        return (
          <Select
            value={currentValue?.[0] || ""}
            onValueChange={(value) =>
              handleFilter(accessorKey, value ? [value] : undefined)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={column.filter?.placeholder || "Selecione..."}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {column.filter?.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "date":
        return (
          <Input
            type="date"
            className="w-full"
            value={
              currentValue ? format(new Date(currentValue), "yyyy-MM-dd") : ""
            }
            onChange={(e) => {
              const date = e.target.value
                ? new Date(e.target.value)
                : undefined;
              handleFilter(
                accessorKey,
                date ? format(date, "yyyy-MM-dd") : undefined
              );
            }}
          />
        );

      case "dateRange":
        return (
          <div className="flex gap-2">
            <Input
              type="date"
              className="w-full"
              value={
                currentValue?.from
                  ? format(new Date(currentValue.from), "yyyy-MM-dd")
                  : ""
              }
              onChange={(e) =>
                handleFilter(accessorKey, {
                  ...currentValue,
                  from: e.target.value
                    ? format(new Date(e.target.value), "yyyy-MM-dd")
                    : undefined,
                })
              }
            />
            <Input
              type="date"
              className="w-full"
              value={
                currentValue?.to
                  ? format(new Date(currentValue.to), "yyyy-MM-dd")
                  : ""
              }
              onChange={(e) =>
                handleFilter(accessorKey, {
                  ...currentValue,
                  to: e.target.value
                    ? format(new Date(e.target.value), "yyyy-MM-dd")
                    : undefined,
                })
              }
            />
          </div>
        );

      case "number":
        return (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Mínimo"
              value={currentValue?.min || ""}
              onChange={(e) =>
                handleFilter(accessorKey, {
                  ...currentValue,
                  min: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <Input
              type="number"
              placeholder="Máximo"
              value={currentValue?.max || ""}
              onChange={(e) =>
                handleFilter(accessorKey, {
                  ...currentValue,
                  max: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
        );

      case "boolean":
        return (
          <Select
            value={
              currentValue === undefined ? "" : currentValue ? "true" : "false"
            }
            onValueChange={(value) =>
              handleFilter(
                accessorKey,
                value === "" ? undefined : value === "true"
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={column.filter?.placeholder || "Todos"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="true">Sim</SelectItem>
              <SelectItem value="false">Não</SelectItem>
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            type="text"
            placeholder={column.filter?.placeholder || "Filtrar..."}
            value={currentValue || ""}
            onChange={(e) => handleFilter(accessorKey, e.target.value)}
          />
        );
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Limpar busca</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFilters.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Limpar filtros ({activeFilters.length})
            </Button>
          )}
          <Button
            variant={showAdvancedFilters ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros avançados
          </Button>
        </div>
      </div>

      {/* Active Filters Badges */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((columnKey) => {
            const column = columns.find((c) => c.accessorKey === columnKey);
            if (!column) return null;

            const filterValue = filters[columnKey];
            let displayValue = "";

            if (Array.isArray(filterValue)) {
              displayValue = filterValue.join(", ");
            } else if (filterValue?.from && filterValue?.to) {
              displayValue = `${format(
                new Date(filterValue.from),
                "PPP"
              )} - ${format(new Date(filterValue.to), "PPP")}`;
            } else if (filterValue?.from) {
              displayValue = `Desde ${format(
                new Date(filterValue.from),
                "PPP"
              )}`;
            } else if (filterValue?.to) {
              displayValue = `Até ${format(new Date(filterValue.to), "PPP")}`;
            } else if (typeof filterValue === "object") {
              if (
                filterValue.min !== undefined &&
                filterValue.max !== undefined
              ) {
                displayValue = `${filterValue.min} - ${filterValue.max}`;
              } else if (filterValue.min !== undefined) {
                displayValue = `≥ ${filterValue.min}`;
              } else if (filterValue.max !== undefined) {
                displayValue = `≤ ${filterValue.max}`;
              }
            } else {
              displayValue = String(filterValue);
            }

            return (
              <Badge
                key={columnKey}
                variant="outline"
                className="flex items-center gap-1"
              >
                <span className="font-medium">{column.header}:</span>
                <span>{displayValue}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilter(columnKey);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="p-4 border rounded-md bg-muted/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns
              .filter((column) => column.enableFiltering !== false)
              .map((column) => (
                <div key={String(column.accessorKey)}>
                  <label className="block text-sm font-medium mb-1">
                    {column.header}
                  </label>
                  {renderFilterInput(column)}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton rows={10} columns={columns.length} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={String(column.accessorKey)}
                      className={column.meta?.className}
                    >
                      {column.enableSorting !== false ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`-ml-3 h-8 hover:bg-accent/50 data-[state=open]:bg-accent ${
                            sorting.find((s) => s.column === column.accessorKey)
                              ? "bg-accent/30 font-semibold"
                              : ""
                          }`}
                          onClick={() => handleSort(String(column.accessorKey))}
                        >
                          <span className="font-medium">{column.header}</span>
                          {(() => {
                            const s = sorting.find(
                              (s) => s.column === column.accessorKey
                            );
                            if (s?.direction === "asc")
                              return (
                                <ArrowUp className="ml-2 h-4 w-4 text-foreground" />
                              );
                            if (s?.direction === "desc")
                              return (
                                <ArrowDown className="ml-2 h-4 w-4 text-foreground" />
                              );
                            return (
                              <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground opacity-50 hover:opacity-100" />
                            );
                          })()}
                        </Button>
                      ) : (
                        column.header
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      onClick={() => onRowClick?.(row)}
                      className={
                        onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                      }
                    >
                      {columns.map((column) => {
                        const accessor = String(column.accessorKey);
                        const value = row?.[accessor] ?? null;

                        return (
                          <TableCell
                            key={`${rowIndex}-${accessor}`}
                            className={column.meta?.className}
                          >
                            {column.cell ? (
                              column.cell({
                                row,
                                getValue: () => row?.[accessor],
                                value,
                              })
                            ) : (
                              <span>
                                {value !== null ? String(value) : "N/A"}
                              </span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      {data.length === 0
                        ? "Nenhum dado disponível"
                        : "Nenhum resultado encontrado"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {enablePagination &&
        (filteredData.length > 0 || enableServerSidePagination) && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Itens por página:
              </span>
              <Select
                value={String(effectivePagination.pageSize)}
                onValueChange={(value) => handlePageSizeChange(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={effectivePagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(0)}
                disabled={effectivePagination.page === 0}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(effectivePagination.page - 1)}
                disabled={effectivePagination.page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm">
                Página {effectivePagination.page + 1} de{" "}
                {Math.max(1, totalPages)}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(effectivePagination.page + 1)}
                disabled={
                  effectivePagination.page >= totalPages - 1 || totalPages === 0
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={
                  effectivePagination.page >= totalPages - 1 || totalPages === 0
                }
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}
