import useSWR from 'swr';

export function usePaginatedResource<T>(
  key: string,
  fetcherFn: (params: any) => Promise<T>,
  params: any
) {
  const serializedParams = JSON.stringify(params);

  const { data, error, isLoading, mutate } = useSWR<T>(
    [key, serializedParams], // chave reativa
    async ([, serialized]) => {
      const parsed = JSON.parse(serialized as string);
      return fetcherFn(parsed);
    }
  );

  return {
    data,
    error,
    isLoading,
    isEmpty: !isLoading && !error && !!data && Array.isArray((data as any)?.content) && (data as any)?.content.length === 0,
    refetch: mutate,
  };
}
