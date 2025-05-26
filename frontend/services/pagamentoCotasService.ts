import { fetcher } from "@/lib/fetcher";
import { PaginationParams, Page } from "@/types/paginacao";
import { buildQuery } from "@/lib/query-builder";
import { PagamentoCotasResponseDTO, PagamentoCotasRequestDTO } from "@/types/pagamentoCotas";

export const getPagamentosCotas = async (
    params: PaginationParams
): Promise<Page<PagamentoCotasResponseDTO>> => {
    const query = buildQuery(params);
    return await fetcher<Page<PagamentoCotasResponseDTO>>(
        `/pagamento-cotas?${query}`
    );
};

export const getPagamentoCotasById = async (
    id: string
): Promise<PagamentoCotasResponseDTO> => {
    return await fetcher<PagamentoCotasResponseDTO>(
        `/pagamento-cotas/${id}`
    );
};

export const uploadPagamentoCotas = async (
  file: File
): Promise<PagamentoCotasResponseDTO> => {
  const formData = new FormData();
  formData.append('file', file);

  return fetcher<PagamentoCotasResponseDTO>('/pagamento-cotas/upload', {
    method: 'POST',
    body: formData,
  });
};

export const criarPagamentoCotas = async (
    data: PagamentoCotasRequestDTO
): Promise<PagamentoCotasResponseDTO> => {
    return fetcher<PagamentoCotasResponseDTO>(`/pagamento-cotas`, {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const atualizarPagamentoCotas = async (
    id: string,
    data: PagamentoCotasRequestDTO
): Promise<PagamentoCotasResponseDTO> => {
    return fetcher<PagamentoCotasResponseDTO>(
        `/pagamento-cotas/${id}`,
        {
            method: "PUT",
            body: JSON.stringify(data),
        }
    );
};

export const excluirPagamentoCotas = async (id: string): Promise<void> => {
    return fetcher<void>(`/pagamento-cotas/${id}`, {
        method: "DELETE",
    });
};