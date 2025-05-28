export type BaseOrcamentariaResponseDTO = {
  id: string;
  lancto: string;
  valor: number;
  dtDocto: string;
  dtLancto: string;
  ano: string;
  tipo: string;
  status: string;
};

export type BaseOrcamentariaRequestDTO = {
  lancto: string;
  valor: number;
  dtDocto: string;
  dtLancto: string;
  ano: string;
  tipo: string;
};
