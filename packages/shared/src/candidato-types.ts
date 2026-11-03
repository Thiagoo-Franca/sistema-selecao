export type TipoCandidato = "mestrado" | "doutorado";

export type ResponsavelCandidato = {
  id: string;
  nome: string;
};

export type CandidatoResumo = {
  id: string;
  tipo: TipoCandidato;
  numeroInscricao: string | null;
  nome: string;
  email: string | null;
  avaliadorId: string | null;
  avaliador: string | null;
  auditorId: string | null;
  auditor: string | null;
  avaliado: boolean;
  area1: string | null;
  area2: string | null;
};

export type CandidatoComRelacoes<TCandidato, TNota> = TCandidato & {
  notas: TNota | null;
  avaliador: ResponsavelCandidato | null;
  auditor: ResponsavelCandidato | null;
};

export type NotaMestradoUpdate = Partial<{
  grad: number | null;
  area: number | null;
  enade: number | null;
  a1a2a3a4: number | null;
  b1b2b3b4: number | null;
  icIt: number | null;
  poscomp: number | null;
  disciplinaPosCapes6Mais: number | null;
  disciplinaPosCapes3a5: number | null;
  notaEtapaII: number | null;
}>;
