import { fetcher } from '@/lib/fetcher';
import { BalanceteResponseDTO, CreateBalanceteDTO } from '@/types/balancete';
import { PaginationParams, Page } from '@/types/paginacao';
import { buildQuery } from '@/lib/query-builder';

export const getBalancetes = async (
  params: PaginationParams
): Promise<Page<BalanceteResponseDTO>> => {
  const query = buildQuery(params);
  return await fetcher<Page<BalanceteResponseDTO>>(`/balancete-cfoab?${query}`);
};

export const createBalancete = async (
  data: CreateBalanceteDTO
): Promise<BalanceteResponseDTO> => {
  return fetcher<BalanceteResponseDTO>('/balancete-cfoab', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const uploadBalancete = async (
  file: File
): Promise<BalanceteResponseDTO> => {
  const formData = new FormData();
  formData.append('file', file);

  return fetcher<BalanceteResponseDTO>('/balancete-cfoab/upload', {
    method: 'POST',
    body: formData,
  });
};

export const getBalanceteById = async (
  id: string
): Promise<BalanceteResponseDTO> => {
  return await fetcher<BalanceteResponseDTO>(`/balancete-cfoab/${id}`);
};

export const updateBalancete = async (
  id: string,
  data: CreateBalanceteDTO
): Promise<BalanceteResponseDTO> => {
  return fetcher<BalanceteResponseDTO>(`/balancete-cfoab/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteBalancete = async (id: string): Promise<void> => {
  return fetcher<void>(`/balancete-cfoab/${id}`, {
    method: 'DELETE',
  });
};