export type PagamentoCotasResponseDTO = {
    id: number;
    instituicaoId: number;
    mesReferencia: string;
    ano: string;
    dtPrevEntr: string;
    valorDuodecimo: number;
    valorDesconto: number;
    tipoDescontoId: number;
    valorPago: number;
    dtPagto: string; 
    observacao: string;
    status: boolean;
}

export type PagamentoCotasRequestDTO = {
    instituicaoId: number;
    mesReferencia: string;
    ano: string;
    dtPrevEntr: string; 
    valorDuodecimo: number;
    valorDesconto: number;
    tipoDescontoId: number;
    valorPago: number;
    dtPagto: string;
    observacao: string;
}