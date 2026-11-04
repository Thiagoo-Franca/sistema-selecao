import type { SelectUser } from "../../database/schema.js";

export type UsuarioPublico = Omit<SelectUser, "passwordHash" | "createdAt">;

export const toUsuarioPublico = ({
  passwordHash: _passwordHash,
  createdAt: _createdAt,
  ...usuario
}: SelectUser): UsuarioPublico => usuario;
