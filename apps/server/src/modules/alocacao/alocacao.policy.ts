export type ProfessorDisponivel = {
  id: string;
  carga: number;
  areas: string[] | null;
};

export function escolherProfessor(
  professores: ProfessorDisponivel[],
  area: string | null,
  excluirIds: string[] = [],
): string | null {
  const candidatos = professores
    .filter((professor) => !excluirIds.includes(professor.id))
    .filter((professor) => !area || professor.areas?.includes(area))
    .sort((a, b) => a.carga - b.carga || a.id.localeCompare(b.id));

  return candidatos[0]?.id ?? null;
}
