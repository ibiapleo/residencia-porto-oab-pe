import { fetcher } from "@/lib/fetcher";
import { PaginationParams, Page } from "@/types/paginacao";
import { buildQuery } from "@/lib/query-builder";
import { CargoResponseDTO, CargoRequestDTO } from "@/types/cargo";

export const getCargos = async (
  params: PaginationParams
): Promise<Page<CargoResponseDTO>> => {
  const query = buildQuery(params);
  return await fetcher<Page<CargoResponseDTO>>(`/roles?${query}`);
};

export const criarCargo = async (
  data: CargoRequestDTO
): Promise<CargoResponseDTO> => {
  return fetcher<CargoResponseDTO>(`/roles`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};


