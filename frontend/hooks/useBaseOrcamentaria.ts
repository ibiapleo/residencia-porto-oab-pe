// hooks/useBalancete.ts
import { usePaginatedResource } from '@/hooks/usePaginatedResource';
import { getBaseOrcamentarias } from '@/services/baseOrcamentariaService';
import { BaseOrcamentariaResponseDTO } from '@/types/baseOrcamentaria';
import { Page, PaginationParams } from '@/types/paginacao';

export function useBaseOrcamentaria(params: PaginationParams) {
  return usePaginatedResource<Page<BaseOrcamentariaResponseDTO>>('/base-orcamentaria', getBaseOrcamentarias, params);
}
