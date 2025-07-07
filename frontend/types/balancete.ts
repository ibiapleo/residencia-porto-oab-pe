import { Periodicidade } from "./periodicidade";

export type CreateBalanceteDTO = {
  demonstrativoNome: string;
  referencia: string;
  ano: string;
  periodicidade: string;
  dtPrevEntr: string;
  dtEntr: string | null;
};

export type BalanceteResponseDTO = {
  id: number;
  nomeDemonstrativo: string;
  demonstrativoId: string;
  referencia: string;
  ano: string;
  periodicidade: Periodicidade;
  dtPrevEntr: Date;
  dtEntr: Date | null;
  eficiencia: number | null;
  usuarioId: number | null;
};

