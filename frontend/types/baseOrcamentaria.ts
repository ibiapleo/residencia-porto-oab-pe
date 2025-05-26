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
  idLancto: number;
  lancto: string;
  valor: number;
  dtDocto: string;
  dtLancto: string;
  ano: string;
  tipo: string;
};
