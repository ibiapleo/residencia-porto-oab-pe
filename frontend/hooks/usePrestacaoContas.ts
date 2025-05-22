// hooks/useBalancete.ts
import { usePaginatedResource } from '@/hooks/usePaginatedResource';
import { getPrestacoesContas } from '@/services/prestacaoContasService';
import { PrestacaoContasSubseccionalResponseDTO } from '@/types/prestacaoContas';
import { Page, PaginationParams } from '@/types/paginacao';

export function usePrestacaoContas(params: PaginationParams) {
  return usePaginatedResource<Page<PrestacaoContasSubseccionalResponseDTO>>('/prestacao-contas', getPrestacoesContas, params);
}
