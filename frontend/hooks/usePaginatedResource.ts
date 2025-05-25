// hooks/usePaginatedResource.ts
import useSWR from 'swr';
import { useMemo } from 'react';
import { PaginationParams } from '@/types/paginacao';
import { buildQuery } from '@/lib/query-builder';

export function usePaginatedResource<T>(
  key: string,
  fetcherFn: (params: PaginationParams) => Promise<T>,
  params: PaginationParams
) {
  const query = useMemo(() => buildQuery(params), [params]);
  const fullKey = `${key}?${query}`;
  const { data, error, isLoading, mutate } = useSWR<T>(fullKey, () => fetcherFn(params));

  return {
    data,
    error,
    isLoading,
    isEmpty: !isLoading && !error && !!data && Array.isArray((data as any)?.content) && (data as any)?.content.length === 0,
    refetch: mutate,
  };
}
