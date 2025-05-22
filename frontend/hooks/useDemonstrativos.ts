// hooks/useBalancete.ts
import { usePaginatedResource } from '@/hooks/usePaginatedResource';
import { getDemonstrativos } from '@/services/demonstrativoService';
import { DemonstrativoResponseDTO } from '@/types/demonstrativo';
import { Page, PaginationParams } from '@/types/paginacao';

export function useDemonstrativos(params: PaginationParams) {
  return usePaginatedResource<Page<DemonstrativoResponseDTO>>('/demonstrativos', getDemonstrativos, params);
}
