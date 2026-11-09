import { and, eq, sql } from "drizzle-orm";
import {
  CandidatoDoutorado,
  CandidatoMestrado,
  Users,
} from "../../database/schema.js";
import type { db } from "../../database/index.js";
import {
  escolherAvaliadorEAuditor,
  registrarAlocacao,
  type ProfessorDisponivel,
} from "./alocacao.policy.js";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const cargaProfessor = sql<number>`(
  select count(*) from candidato_mestrado cm
  where cm.avaliador_id = ${Users.id} or cm.auditor_id = ${Users.id}
) + (
  select count(*) from candidato_doutorado cd
  where cd.avaliador_id = ${Users.id} or cd.auditor_id = ${Users.id}
)`;

async function listarProfessores(tx: Tx): Promise<ProfessorDisponivel[]> {
  const professores = await tx
    .select({
      id: Users.id,
      areas: Users.areas,
      carga: cargaProfessor,
    })
    .from(Users)
    .where(and(eq(Users.role, "TEACHER"), eq(Users.ativo, true)));

  return professores.map((professor) => ({
    id: professor.id,
    areas: professor.areas,
    carga: Number(professor.carga),
  }));
}

export async function alocarCandidatoMestrado(
  tx: Tx,
  candidato: {
    primeiraAreaPreferencia: string | null;
    segundaAreaPreferencia: string | null;
  },
): Promise<{ avaliadorId: string | null; auditorId: string | null }> {
  const professores = await listarProfessores(tx);
  return escolherAvaliadorEAuditor(
    professores,
    [candidato.primeiraAreaPreferencia, candidato.segundaAreaPreferencia].filter(
      (area): area is string => Boolean(area),
    ),
  );
}

export async function alocarLoteMestrado(
  tx: Tx,
  candidatos: Array<{
    id: string;
    primeiraAreaPreferencia: string | null;
    segundaAreaPreferencia: string | null;
  }>,
) {
  const professores = await listarProfessores(tx);
  const resultado = [];
  for (const candidato of candidatos) {
    const alocacao = escolherAvaliadorEAuditor(
      professores,
      [candidato.primeiraAreaPreferencia, candidato.segundaAreaPreferencia].filter(
        (area): area is string => Boolean(area),
      ),
    );
    const [atualizado] = await tx
      .update(CandidatoMestrado)
      .set(alocacao)
      .where(eq(CandidatoMestrado.id, candidato.id))
      .returning();
    registrarAlocacao(professores, alocacao);
    resultado.push(atualizado ?? candidato);
  }
  return resultado;
}

export { cargaProfessor };
