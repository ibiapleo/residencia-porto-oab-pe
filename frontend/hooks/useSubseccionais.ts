// hooks/useBalancete.ts
import { usePaginatedResource } from '@/hooks/usePaginatedResource';
import { SubseccionalResponseDTO } from '@/types/subseccional';
import { Page, PaginationParams } from '@/types/paginacao';
import { getSubseccionais } from '@/services/subseccionalService';

export function useSubseccionais(params: PaginationParams) {
  return usePaginatedResource<Page<SubseccionalResponseDTO>>('/subseccionais', getSubseccionais, params);
}
