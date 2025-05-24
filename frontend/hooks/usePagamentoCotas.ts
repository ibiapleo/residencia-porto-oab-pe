import { usePaginatedResource } from '@/hooks/usePaginatedResource';
import { getPagamentosCotas } from '@/services/pagamentoCotasService';
import { PagamentoCotasResponseDTO } from '@/types/pagamentoCotas';
import { Page, PaginationParams } from '@/types/paginacao';

export function usePagamentoCotas(params: PaginationParams) {
  return usePaginatedResource<Page<PagamentoCotasResponseDTO>>('/pagamentos-cotas', getPagamentosCotas, params);
}
