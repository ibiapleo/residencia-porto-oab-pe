// hooks/useBalancete.ts
import { usePaginatedResource } from '@/hooks/usePaginatedResource';
import { getCargos } from '@/services/cargoService';
import { CargoResponseDTO } from '@/types/cargo';
import { Page, PaginationParams } from '@/types/paginacao';

export function useCargo(params: PaginationParams) {
  return usePaginatedResource<Page<CargoResponseDTO>>('/roles', getCargos, params);
}
