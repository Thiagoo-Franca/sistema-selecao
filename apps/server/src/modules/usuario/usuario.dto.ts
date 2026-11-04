import type { SelectUser } from "../../database/schema.js";
import { Users } from "../../database/schema.js";

export type UsuarioPublico = Omit<SelectUser, "passwordHash" | "createdAt">;

export const usuarioPublicoProjection = {
  id: Users.id,
  email: Users.email,
  nome: Users.nome,
  school: Users.school,
  matricula: Users.matricula,
  areas: Users.areas,
  academicTitle: Users.academicTitle,
  ativo: Users.ativo,
  updatedAt: Users.updatedAt,
  role: Users.role,
};

export const toUsuarioPublico = ({
  passwordHash: _passwordHash,
  createdAt: _createdAt,
  ...usuario
}: SelectUser): UsuarioPublico => usuario;
