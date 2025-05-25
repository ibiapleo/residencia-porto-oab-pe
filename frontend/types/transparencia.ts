export type TransparenciaRequestDTO = {
    demonstrativoNome: string;
    referencia: string;
    ano: string;
    periodicidade: string;
    dtPrevEntr: string;
    dtEntrega?: string;
}

export type TransparenciaResponseDTO = {
    id: number;
    demonstrativoId: number;
    nomeDemonstrativo: string;
    referencia: string;
    ano: string;
    periodicidade: string;
    dtPrevEntr: string;
    dtEntrega?: string;
    status: boolean;
}