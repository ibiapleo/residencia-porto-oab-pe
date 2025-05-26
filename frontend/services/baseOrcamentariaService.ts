import { fetcher } from "@/lib/fetcher";
import {
  BaseOrcamentariaRequestDTO,
  BaseOrcamentariaResponseDTO,
} from "@/types/baseOrcamentaria";
import { PaginationParams, Page } from "@/types/paginacao";
import { buildQuery } from "@/lib/query-builder";

export const getBaseOrcamentarias = async (
  params: PaginationParams
): Promise<Page<BaseOrcamentariaResponseDTO>> => {
  const query = buildQuery(params);
  return await fetcher<Page<BaseOrcamentariaResponseDTO>>(
    `/base-orcamentaria?${query}`
  );
};

export const getBaseOrcamentariaById = async (
  id: string
): Promise<BaseOrcamentariaResponseDTO> => {
  return await fetcher<BaseOrcamentariaResponseDTO>(
    `/base-orcamentaria/${id}`
  );
};

export const criarBaseOrcamentaria = async (
  data: BaseOrcamentariaRequestDTO
): Promise<BaseOrcamentariaResponseDTO> => {
  return fetcher<BaseOrcamentariaResponseDTO>(`/base-orcamentaria`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const atualizarBaseOrcamentaria = async (
  id: string,
  data: BaseOrcamentariaRequestDTO
): Promise<BaseOrcamentariaResponseDTO> => {
  return fetcher<BaseOrcamentariaResponseDTO>(
    `/base-orcamentaria/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
};

export const excluirBaseOrcamentaria = async (id: string): Promise<void> => {
  return fetcher<void>(`/base-orcamentaria/${id}`, {
    method: "DELETE",
  });
};