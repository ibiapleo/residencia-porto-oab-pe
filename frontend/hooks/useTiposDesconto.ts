// hooks/useBalancete.ts
import { usePaginatedResource } from '@/hooks/usePaginatedResource';
import { DescontoResponseDTO } from '@/types/tipoDesconto';
import { Page, PaginationParams } from '@/types/paginacao';
import { getDescontos } from '@/services/tipoDescontoService';

export function useTiposDesconto(params: PaginationParams) {
  return usePaginatedResource<Page<DescontoResponseDTO>>('/tipos-desconto', getDescontos, params);
}
