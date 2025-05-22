// src/services/prestacaoContasService.ts

import { fetcher } from "@/lib/fetcher";
import {
  InstituicaoRequestDTO,
  InstituicaoResponseDTO,
} from "@/types/instituicao";
import { PaginationParams, Page } from "@/types/paginacao";
import { buildQuery } from "@/lib/query-builder";

export const getInstituicoes = async (
  params: PaginationParams
): Promise<Page<InstituicaoResponseDTO>> => {
  const query = buildQuery(params);
  return await fetcher<Page<InstituicaoResponseDTO>>(
    `/instituicoes?${query}`
  );
};

export const getInstituicaoById = async (
  id: number
): Promise<InstituicaoResponseDTO> => {
  return await fetcher<InstituicaoResponseDTO>(
    `/instituicoes/${id}`
  );
};

export const criarInstituicao = async (
  data: InstituicaoRequestDTO
): Promise<InstituicaoResponseDTO> => {
  return fetcher<InstituicaoResponseDTO>(`/instituicoes`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const atualizarInstituicao = async (
  id: number,
  data: InstituicaoRequestDTO
): Promise<InstituicaoResponseDTO> => {
  return fetcher<InstituicaoResponseDTO>(
    `/instituicoes/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
};

export const excluirInstituicao = async (id: number): Promise<void> => {
  return fetcher<void>(`/instituicoes/${id}`, {
    method: "DELETE",
  });
};