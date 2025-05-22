export type CreateBalanceteDTO = {
  demonstrativoId: string;
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
  periodicidade: 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';
  dtPrevEntr: string;
  dtEntr: string | null;
  eficiencia: number | null;
  usuarioId: number | null;
};

