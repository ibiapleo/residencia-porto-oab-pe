// hooks/useBalancete.ts
import { usePaginatedResource } from '@/hooks/usePaginatedResource';
import { getBalancetes } from '@/services/balanceteService';
import { BalanceteResponseDTO } from '@/types/balancete';
import { Page, PaginationParams } from '@/types/paginacao';

export function useBalancete(params: PaginationParams, download?: boolean) {
  return usePaginatedResource<Page<BalanceteResponseDTO>>('/balancete-cfoab', getBalancetes, params,);
}

