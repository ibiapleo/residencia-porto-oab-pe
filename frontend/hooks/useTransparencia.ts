// hooks/useBalancete.ts
import { usePaginatedResource } from '@/hooks/usePaginatedResource';
import { getTransparencias } from '@/services/transparenciaService';
import { TransparenciaResponseDTO } from '@/types/transparencia';
import { Page, PaginationParams } from '@/types/paginacao';

export function useTransparencia(params: PaginationParams) {
  return usePaginatedResource<Page<TransparenciaResponseDTO>>('/transparencia', getTransparencias, params);
}
