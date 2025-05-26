// src/services/prestacaoContasService.ts

import { fetcher } from "@/lib/fetcher";
import {
  PrestacaoContasSubseccionalResponseDTO,
  PrestacaoContasSubseccionalRequestDTO,
} from "@/types/prestacaoContas";
import { PaginationParams, Page } from "@/types/paginacao";
import { buildQuery } from "@/lib/query-builder";

export const getPrestacoesContas = async (
  params: PaginationParams
): Promise<Page<PrestacaoContasSubseccionalResponseDTO>> => {
  const query = buildQuery(params);
  return await fetcher<Page<PrestacaoContasSubseccionalResponseDTO>>(
    `/prestacao-contas?${query}`
  );
};

export const getPrestacaoContasById = async (
  id: string
): Promise<PrestacaoContasSubseccionalResponseDTO> => {
  return await fetcher<PrestacaoContasSubseccionalResponseDTO>(
    `/prestacao-contas/${id}`
  );
};

export const criarPrestacaoContas = async (
  data: PrestacaoContasSubseccionalRequestDTO
): Promise<PrestacaoContasSubseccionalResponseDTO> => {
  return fetcher<PrestacaoContasSubseccionalResponseDTO>(`/prestacao-contas`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const uploadPrestacaoContas = async (
  file: File
): Promise<PrestacaoContasSubseccionalResponseDTO> => {
  const formData = new FormData();
  formData.append("file", file);

  return fetcher<PrestacaoContasSubseccionalResponseDTO>("/prestacao-contas/upload", {
    method: "POST",
    body: formData,
  });
};

export const atualizarPrestacaoContas = async (
  id: string,
  data: PrestacaoContasSubseccionalRequestDTO
): Promise<PrestacaoContasSubseccionalResponseDTO> => {
  return fetcher<PrestacaoContasSubseccionalResponseDTO>(
    `/prestacao-contas/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
};

export const excluirPrestacaoContas = async (id: string): Promise<void> => {
  return fetcher<void>(`/prestacao-contas/${id}`, {
    method: "DELETE",
  });
};
