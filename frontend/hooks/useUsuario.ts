// hooks/useBalancete.ts
import { usePaginatedResource } from '@/hooks/usePaginatedResource';
import { getUsuarios } from '@/services/usuarioService';
import { Page, PaginationParams } from '@/types/paginacao';
import { UsuarioResponseDTO } from '@/types/usuario';

export function useUsuarios(params: PaginationParams) {
  return usePaginatedResource<Page<UsuarioResponseDTO>>('/usuarios', getUsuarios, params);
}
