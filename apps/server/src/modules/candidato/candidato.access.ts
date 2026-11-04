import type { UserRole } from "../../database/schema.js";

export type UsuarioAcessoCandidato = {
  id: string;
  role: UserRole;
};

export type CandidatoComResponsaveis = {
  avaliadorId: string | null;
  auditorId: string | null;
};

export function podeAcessarCandidato(
  usuario: UsuarioAcessoCandidato,
  candidato: CandidatoComResponsaveis,
): boolean {
  return (
    usuario.role === "ADMIN" ||
    candidato.avaliadorId === usuario.id ||
    candidato.auditorId === usuario.id
  );
}
