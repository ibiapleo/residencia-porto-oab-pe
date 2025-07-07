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
  id: string
): Promise<InstituicaoResponseDTO> => {
  return await fetcher<InstituicaoResponseDTO>(
    `/instituicoes/${id}`
  );
};

export const uploadInstituicao = async (
  file: File
): Promise<InstituicaoResponseDTO> => {
  const formData = new FormData();
  formData.append("file", file);

  return fetcher<InstituicaoResponseDTO>("/instituicoes/upload", {
    method: "POST",
    body: formData,
  });
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
  id: string,
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

export const excluirInstituicao = async (id: string): Promise<void> => {
  return fetcher<void>(`/instituicoes/${id}`, {
    method: "DELETE",
  });
};