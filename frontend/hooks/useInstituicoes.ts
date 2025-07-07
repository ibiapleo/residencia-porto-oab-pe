// hooks/useBalancete.ts
import { usePaginatedResource } from '@/hooks/usePaginatedResource';
import { InstituicaoResponseDTO } from '@/types/instituicao';
import { Page, PaginationParams } from '@/types/paginacao';
import { getInstituicoes } from '@/services/instituicaoService';

export function useInstituicoes(params: PaginationParams) {
  return usePaginatedResource<Page<InstituicaoResponseDTO>>('/instituicoes', getInstituicoes, params);
}
