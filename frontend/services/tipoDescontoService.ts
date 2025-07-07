import { fetcher } from "@/lib/fetcher";
import {
  DescontoRequestDTO,
  DescontoResponseDTO
} from "@/types/tipoDesconto";
import { PaginationParams, Page } from "@/types/paginacao";
import { buildQuery } from "@/lib/query-builder";

export const getDescontos = async (
  params: PaginationParams
): Promise<Page<DescontoResponseDTO>> => {
  const query = buildQuery(params);
  return await fetcher<Page<DescontoResponseDTO>>(
    `/tipos-desconto?${query}`
  );
};

export const getDescontoById = async (
  id: string
): Promise<DescontoResponseDTO> => {
  return await fetcher<DescontoResponseDTO>(
    `/tipos-desconto/${id}`
  );
};

export const uploadTiposDesconto = async (
  file: File
): Promise<DescontoResponseDTO> => {
  const formData = new FormData();
  formData.append('file', file);

  return fetcher<DescontoResponseDTO>('/tipo-desconto/upload', {
    method: 'POST',
    body: formData,
  });
};

export const criarDesconto = async (
  data: DescontoRequestDTO
): Promise<DescontoResponseDTO> => {
  return fetcher<DescontoResponseDTO>(`/tipos-desconto`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const atualizarDesconto = async (
  id: string,
  data: DescontoRequestDTO
): Promise<DescontoResponseDTO> => {
  return fetcher<DescontoResponseDTO>(
    `/tipos-desconto/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
};

export const excluirDesconto = async (id: string): Promise<void> => {
  return fetcher<void>(`/tipos-desconto/${id}`, {
    method: "DELETE",
  });
};