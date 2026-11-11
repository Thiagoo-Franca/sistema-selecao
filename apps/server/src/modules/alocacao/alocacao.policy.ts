export type ProfessorDisponivel = {
  id: string;
  carga: number;
  areas: string[] | null;
  nome?: string;
};

export type Alocacao = {
  avaliadorId: string | null;
  auditorId: string | null;
};

const normalizarNome = (nome: string) =>
  nome
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

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

export function escolherAvaliadorEAuditor(
  professores: ProfessorDisponivel[],
  areas: string[],
): Alocacao {
  let avaliadorId: string | null = null;
  for (const area of areas) {
    avaliadorId = escolherProfessor(professores, area);
    if (avaliadorId) break;
  }
  avaliadorId ??= escolherProfessor(professores, null);

  let auditorId: string | null = null;
  for (const area of areas) {
    auditorId = escolherProfessor(
      professores,
      area,
      avaliadorId ? [avaliadorId] : [],
    );
    if (auditorId) break;
  }
  auditorId ??= escolherProfessor(
    professores,
    null,
    avaliadorId ? [avaliadorId] : [],
  );

  return { avaliadorId, auditorId };
}

export function registrarAlocacao(
  professores: ProfessorDisponivel[],
  alocacao: Alocacao,
): void {
  for (const id of [alocacao.avaliadorId, alocacao.auditorId]) {
    if (!id) continue;
    const professor = professores.find((item) => item.id === id);
    if (professor) professor.carga += 1;
  }
}

export function escolherPorOpcoesOrientador(
  professores: ProfessorDisponivel[],
  opcoes: {
    primeira: string | null;
    segunda: string | null;
    terceira: string | null;
  },
): { avaliadorId: string | null; auditorId: string | null } {
  const idPorNome = new Map<string, string>();
  for (const p of professores) {
    if (!p.nome) continue;
    const chave = normalizarNome(p.nome);
    if (!idPorNome.has(chave)) idPorNome.set(chave, p.id); // duplicado: o primeiro vence
  }

  const encontrados: string[] = [];
  for (const nome of [opcoes.primeira, opcoes.segunda, opcoes.terceira]) {
    if (!nome?.trim()) continue;
    const id = idPorNome.get(normalizarNome(nome));
    if (id && !encontrados.includes(id)) encontrados.push(id); // evita repetir professor
  }

  return {
    avaliadorId: encontrados[0] ?? null,
    auditorId: encontrados[1] ?? null,
  };
}
