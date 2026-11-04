import { sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

type CandidateTable = {
  id: AnyPgColumn;
  tipoCurso: AnyPgColumn;
  numeroInscricao: AnyPgColumn;
  nome: AnyPgColumn;
  email: AnyPgColumn;
  avaliadorId: AnyPgColumn;
  auditorId: AnyPgColumn;
};
type NoteTable = { avaliado: AnyPgColumn };

export const createCandidatoResumoProjection = <
  TCandidate extends CandidateTable,
  TNote extends NoteTable,
  TArea1 extends AnyPgColumn,
  TArea2 extends AnyPgColumn,
  TAvaliador extends AnyPgColumn,
  TAuditor extends AnyPgColumn,
>(
  candidato: TCandidate,
  nota: TNote,
  area1: TArea1,
  area2: TArea2,
  avaliador: TAvaliador,
  auditor: TAuditor,
) => ({
  id: candidato.id,
  tipo: candidato.tipoCurso,
  numeroInscricao: candidato.numeroInscricao,
  nome: candidato.nome,
  email: candidato.email,
  avaliadorId: candidato.avaliadorId,
  avaliador,
  auditorId: candidato.auditorId,
  auditor,
  avaliado: sql<boolean>`coalesce(${nota.avaliado}, false)`,
  area1,
  area2,
});
