// src/services/prestacaoContasService.ts

import { fetcher } from "@/lib/fetcher";
import {
  SubseccionalRequestDTO,
  SubseccionalResponseDTO
} from "@/types/subseccional";
import { PaginationParams, Page } from "@/types/paginacao";
import { buildQuery } from "@/lib/query-builder";

export const getSubseccionais = async (
  params: PaginationParams
): Promise<Page<SubseccionalResponseDTO>> => {
  const query = buildQuery(params);
  return await fetcher<Page<SubseccionalResponseDTO>>(
    `/subseccionais?${query}`
  );
};

export const getSubseccionalById = async (
  id: string
): Promise<SubseccionalResponseDTO> => {
  return await fetcher<SubseccionalResponseDTO>(
    `/subseccionais/${id}`
  );
};

export const criarSubseccional = async (
  data: SubseccionalRequestDTO
): Promise<SubseccionalResponseDTO> => {
  return fetcher<SubseccionalResponseDTO>(`/subseccionais`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const atualizarSubseccional = async (
  id: string,
  data: SubseccionalRequestDTO
): Promise<SubseccionalResponseDTO> => {
  return fetcher<SubseccionalResponseDTO>(
    `/subseccionais/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
};

export const excluirSubseccional = async (id: string): Promise<void> => {
  return fetcher<void>(`/subseccionais/${id}`, {
    method: "DELETE",
  });
};