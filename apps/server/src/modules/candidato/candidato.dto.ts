import type {
  SelectCandidatoDoutorado,
  SelectCandidatoMestrado,
  SelectNotaDoutorado,
  SelectNotaMestrado,
} from "../../database/schema.js";
import type { ResponsavelCandidato } from "@tcc/shared";

export type CandidatoMestradoPublico = SelectCandidatoMestrado;
export type CandidatoDoutoradoPublico = SelectCandidatoDoutorado;
export type NotaMestradoPublica = SelectNotaMestrado;
export type NotaDoutoradoPublica = SelectNotaDoutorado;

export type CandidatoMestradoDetalhe = CandidatoMestradoPublico & {
  notas: NotaMestradoPublica | null;
  avaliador: ResponsavelCandidato | null;
  auditor: ResponsavelCandidato | null;
};

export type CandidatoDoutoradoDetalhe = CandidatoDoutoradoPublico & {
  notas: NotaDoutoradoPublica | null;
  avaliador: ResponsavelCandidato | null;
  auditor: ResponsavelCandidato | null;
};

type CandidatoComResponsaveis<TCandidato, TNota> = {
  candidato: TCandidato;
  notas: TNota | null;
  avaliadorId: string | null;
  avaliadorNome: string | null;
  auditorId: string | null;
  auditorNome: string | null;
};

const mapResponsavel = (
  id: string | null,
  nome: string | null,
): ResponsavelCandidato | null =>
  id !== null && nome !== null ? { id, nome } : null;

export const toCandidatoMestradoDetalhe = ({
  candidato,
  notas,
  avaliadorId,
  avaliadorNome,
  auditorId,
  auditorNome,
}: CandidatoComResponsaveis<
  CandidatoMestradoPublico,
  NotaMestradoPublica
>): CandidatoMestradoDetalhe => ({
  ...candidato,
  notas,
  avaliador: mapResponsavel(avaliadorId, avaliadorNome),
  auditor: mapResponsavel(auditorId, auditorNome),
});

export const toCandidatoDoutoradoDetalhe = ({
  candidato,
  notas,
  avaliadorId,
  avaliadorNome,
  auditorId,
  auditorNome,
}: CandidatoComResponsaveis<
  CandidatoDoutoradoPublico,
  NotaDoutoradoPublica
>): CandidatoDoutoradoDetalhe => ({
  ...candidato,
  notas,
  avaliador: mapResponsavel(avaliadorId, avaliadorNome),
  auditor: mapResponsavel(auditorId, auditorNome),
});
