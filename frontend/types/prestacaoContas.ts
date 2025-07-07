// src/types/prestacaoContas.ts

export interface PrestacaoContasSubseccionalResponseDTO {
  id: string;
  mesReferencia: string;
  ano: string;
  dtPrevEntr: string; // ou Date se você converter
  dtEntrega: string; // ou Date se você converter
  dtPagto: string; // ou Date se você converter
  valorDuodecimo: number;
  valorDesconto: number;
  protocoloSGD: string;
  observacao: string;
  status: string;
  valorPago: number;
  subseccional: string;
  subseccionalId: string;
  tipoDesconto: string;
  tipoDescontoId: string;
  usuarioId: string;
}

export interface PrestacaoContasSubseccionalRequestDTO {
  subseccional: string;
  mesReferencia: string;
  ano: string;
  dtPrevEntr: string; // ou Date se você converter
  dtEntrega: string; // ou Date se você converter
  dtPagto: string; // ou Date se você converter
  valorDuodecimo: number;
  valorDesconto: number;
  protocoloSGD: string;
  observacao: string;
  tipoDescontoId: string;
}