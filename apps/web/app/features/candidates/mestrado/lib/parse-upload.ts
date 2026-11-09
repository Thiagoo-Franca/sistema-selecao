const BOOLEANOS = ["homologa", "especiais", "cotas", "supra"] as const

const COLUNAS = [
  "primeiraAreaPreferencia",
  "segundaAreaPreferencia",
  "numeroInscricao",
  "cpf",
  "nome",
  "email",
  "cidadeResidencia",
  "isencaoComprovanteLink",
  "isencaoAprovadaLink",
  "gruLink",
  "homologa",
  "universidade",
  "curso",
  "cidadeGraduacao",
  "especiais",
  "cotas",
  "supra",
] as const

const NOTAS = [
  { chave: "gradLink", tipo: "link" },
  { chave: "area", tipo: "numero" },
  { chave: "enade", tipo: "numero" },
  { chave: "a1a2a3a4Link", tipo: "link" },
  { chave: "b1b2b3b4Link", tipo: "link" },
  { chave: "icItLink", tipo: "link" },
  { chave: "poscompLink", tipo: "link" },
  { chave: "disciplinaPosCapes6MaisLink", tipo: "link" },
  { chave: "disciplinaPosCapes3a5Link", tipo: "link" },
] as const

const TOTAL_COLUNAS = COLUNAS.length + NOTAS.length

const HYPERLINK = /^=HYPERLINK\(\s*"([^"]*)"\s*[;,]\s*"([^"]*)"\s*\)$/i

type CandidatoBase = Omit<
  Record<(typeof COLUNAS)[number], string | null>,
  (typeof BOOLEANOS)[number]
> &
  Record<(typeof BOOLEANOS)[number], boolean | null>

type Notas = Record<
  Exclude<(typeof NOTAS)[number]["chave"], "area" | "enade"> | "enadeLink",
  string | null
> & { area: number | null; enade: number | null }

export type CandidatoMestradoUpload = CandidatoBase & { notas: Notas }

// Células copiadas do Excel/Sheets podem vir como "=HYPERLINK(""url""; ""txt"")"
function limpaCelula(cell?: string): string {
  const v = (cell ?? "").trim()
  if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) {
    return v.slice(1, -1).replace(/""/g, '"').trim()
  }
  return v
}

export function parseHyperlink(cell?: string): { link: string | null; texto: string | null } {
  const v = (cell ?? "").trim()
  if (!v) return { link: null, texto: null }

  const m = v.match(HYPERLINK)
  if (!m) return { link: null, texto: v } // célula comum

  const link = /^https?:\/\//i.test(m[1]) ? m[1] : null // "NÃO SE APLICA" não é link
  return { link, texto: m[2].trim() || null }
}

export function parseNumero(texto: string | null): number | null {
  if (!texto) return null
  const n = Number(texto.replace(",", "."))
  return Number.isFinite(n) ? n : null
}

function parseBooleano(texto: string | null): boolean | null {
  if (!texto) return null
  const v = texto
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
  if (v === "SIM" || v === "TRUE") return true
  if (v === "NAO" || v === "FALSE" || v === "HOMOLOGA?") return false
  return null
}

export function parseCandidatosMestrado(text: string): CandidatoMestradoUpload[] {
  const candidatos: CandidatoMestradoUpload[] = []

  text
    .split(/\r?\n/)
    .filter((linha) => linha.trim() !== "")
    .forEach((linha, idx) => {
      const celulas = linha.split("\t").map(limpaCelula)

      // ignora a linha de cabeçalho colada junto (numeroInscricao não numérico)
      const numeroInscricao = celulas[COLUNAS.indexOf("numeroInscricao")]
      if (!/^\d+$/.test(numeroInscricao ?? "")) return

      if (celulas.length > TOTAL_COLUNAS) {
        throw new Error(
          `Linha ${idx + 1}: esperado no máximo ${TOTAL_COLUNAS} colunas, veio ${celulas.length}`
        )
      }

      const candidato = {} as CandidatoBase
      COLUNAS.forEach((coluna, i) => {
        const { link, texto } = parseHyperlink(celulas[i])

        if ((BOOLEANOS as readonly string[]).includes(coluna)) {
          candidato[coluna as (typeof BOOLEANOS)[number]] = parseBooleano(texto)
          return
        }

        candidato[coluna as Exclude<(typeof COLUNAS)[number], (typeof BOOLEANOS)[number]>] =
          link ?? texto
      })

      const notas = {} as Notas
      NOTAS.forEach(({ chave, tipo }, i) => {
        const { link, texto } = parseHyperlink(celulas[COLUNAS.length + i])

        if (chave === "enade") {
          notas.enade = parseNumero(texto) // nota
          notas.enadeLink = link // url do e-MEC
          return
        }

        if (tipo === "numero") {
          notas[chave as "area"] = parseNumero(texto)
        } else {
          notas[chave as Exclude<typeof chave, "area" | "enade">] = link // só URL válida
        }
      })

      candidatos.push({ ...candidato, notas })
    })

  return candidatos
}
