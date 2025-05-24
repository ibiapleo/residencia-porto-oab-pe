import { fetcher } from "@/lib/fetcher";
import {
  DemonstrativoRequestDTO,
  DemonstrativoResponseDTO
} from "@/types/demonstrativo";
import { PaginationParams, Page } from "@/types/paginacao";
import { buildQuery } from "@/lib/query-builder";

export const getDemonstrativos = async (
  params: PaginationParams
): Promise<Page<DemonstrativoResponseDTO>> => {
  const query = buildQuery(params);
  return await fetcher<Page<DemonstrativoResponseDTO>>(
    `/demonstrativos?${query}`
  );
};

export const getDemonstrativoById = async (
  id: string
): Promise<DemonstrativoResponseDTO> => {
  return await fetcher<DemonstrativoResponseDTO>(
    `/demonstrativos/${id}`
  );
};

export const criarDemonstrativo = async (
  data: DemonstrativoRequestDTO
): Promise<DemonstrativoResponseDTO> => {
  return fetcher<DemonstrativoResponseDTO>(`/demonstrativos`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const atualizarDemonstrativo = async (
  id: string,
  data: DemonstrativoRequestDTO
): Promise<DemonstrativoResponseDTO> => {
  return fetcher<DemonstrativoResponseDTO>(
    `/demonstrativos/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
};

export const excluirDemonstrativo = async (id: string): Promise<void> => {
  return fetcher<void>(`/demonstrativos/${id}`, {
    method: "DELETE",
  });
};