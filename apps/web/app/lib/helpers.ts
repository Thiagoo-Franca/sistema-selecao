import type { useDeleteCandidatoMestrado } from "@/hooks"
import type { useNavigate } from "react-router"
import { GRU_OPTIONS, NAO_SOLICITOU } from "./constants"

export function handleSort(
  key: string,
  setOrderBy?: (orderBy: string) => void,
  setOrder?: (order: "asc" | "desc") => void,
  orderBy?: string,
  order?: "asc" | "desc"
) {
  setOrder?.(orderBy === key && order === "asc" ? "desc" : "asc")
  setOrderBy?.(key)
}

export function removerAcentos(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export function valorIsencaoSelect(valor?: string | null) {
  if (valor == null) return undefined
  return valor.trim().toUpperCase() === NAO_SOLICITOU ? "nao" : "sim"
}

export function normalizeGru(value: string | null | undefined) {
  const v = (value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .replace(/\s+/g, "-") // "nao pagou" -> "nao-pagou"

  return GRU_OPTIONS.find((o) => o.value === v)?.value ?? ""
}

export function paraBooleano(value: unknown): boolean | undefined {
  if (value === true || value === 1) return true
  if (value === false || value === 0) return false

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase()
    if (["true", "t", "sim", "1"].includes(normalizedValue)) return true
    if (["false", "f", "nao", "não", "0"].includes(normalizedValue)) return false
  }

  return undefined
}

export function valorBooleanoSelect(value: boolean | undefined) {
  return value === undefined ? "" : value ? "sim" : "nao"
}

export function valorSimNaoSelect(value: unknown) {
  if (value === true || value === 1) return "sim"
  if (value === false || value === 0) return "nao"

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase()
    if (["sim", "true", "t", "1"].includes(normalizedValue)) return "sim"
    if (["nao", "não", "false", "f", "0"].includes(normalizedValue)) return "nao"
  }

  return ""
}

export function handleDelete(
  deleteCandidatoMutation: ReturnType<typeof useDeleteCandidatoMestrado>,
  navigate: ReturnType<typeof useNavigate>
) {
  if (!confirm("Tem certeza que deseja excluir este candidato?")) return

  deleteCandidatoMutation
    .mutateAsync()
    .then(() => navigate("/dashboard"))
    .catch(() => undefined)
}
