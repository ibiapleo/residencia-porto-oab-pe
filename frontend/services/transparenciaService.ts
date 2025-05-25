import { fetcher } from '@/lib/fetcher';
import { TransparenciaResponseDTO,TransparenciaRequestDTO } from '@/types/transparencia';
import { PaginationParams, Page } from '@/types/paginacao';
import { buildQuery } from '@/lib/query-builder';

export const getTransparencias = async (
  params: PaginationParams
): Promise<Page<TransparenciaResponseDTO>> => {
  const query = buildQuery(params);
  return await fetcher<Page<TransparenciaResponseDTO>>(`/transparencia?${query}`);
};

export const criarTransparencia = async (
  data: TransparenciaRequestDTO
): Promise<TransparenciaResponseDTO> => {
  return fetcher<TransparenciaResponseDTO>('/transparencia', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getTransparenciaById = async (
  id: string
): Promise<TransparenciaResponseDTO> => {
  return await fetcher<TransparenciaResponseDTO>(`/transparencia/${id}`);
};

export const atualizarTransparencia = async (
  id: string,
  data: TransparenciaRequestDTO
): Promise<TransparenciaResponseDTO> => {
  return fetcher<TransparenciaResponseDTO>(`/transparencia/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const excluirTransparencia = async (id: string): Promise<void> => {
  return fetcher<void>(`/transparencia/${id}`, {
    method: 'DELETE',
  });
};