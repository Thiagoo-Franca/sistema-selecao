export type CandidatoDoutoradoNotaEtapa1 = {
  msc: number // nota do mestrado
  areaFormacaoGraduacao: number
  conceitoCapesMestrado: number
  a1a2a3a4: number
  b1b2b3b4: number
  notaAnteprojeto: number
}

export type CandidatoMestradoNota = {
  grad: number
  area: number
  enade: number
  a1a2a3a4: number
  b1b2b3b4: number
  icIt: number
  poscomp: number
  disciplinaPosCapes6Mais: number
  disciplinaPosCapes3a5: number
  notaEtapaII: number
}

// para evitar NaN
export function paraNumeroSeguro(valor: number | undefined): number {
  return typeof valor === "number" && !Number.isNaN(valor) ? valor : 0
}

export function calcularMestradoNota({
  grad,
  area,
  enade,
  a1a2a3a4,
  b1b2b3b4,
  icIt,
  poscomp,
  disciplinaPosCapes6Mais,
  disciplinaPosCapes3a5,
  notaEtapaII,
}: CandidatoMestradoNota): { pontuacao: number; aprovado: boolean } {
  const RGRAD = (grad * area * 7 + enade * 2 * 3) / 10

  const RPQ_GRAD = Math.min(
    10,
    Math.min(10, a1a2a3a4 * 2) +
      Math.min(5, b1b2b3b4) +
      Math.min(6, icIt * 2) +
      poscomp / 7 +
      Math.min(6, disciplinaPosCapes6Mais * 2) +
      Math.min(4, disciplinaPosCapes3a5)
  )

  const notaEtapaI = (RGRAD * 8 + RPQ_GRAD * 2) / 10
  const pontuacao = (notaEtapaI + notaEtapaII) / 2
  return { pontuacao: pontuacao, aprovado: pontuacao >= 5 }
}

export function calcularNotaDoutoradoEtapa1({
  msc,
  areaFormacaoGraduacao,
  conceitoCapesMestrado,
  a1a2a3a4,
  b1b2b3b4,
  notaAnteprojeto,
}: CandidatoDoutoradoNotaEtapa1): { pontuacao: number; aprovado: boolean } {
  // ROQ_MSC = MÍNIMO(10;(MÍNIMO(10;(Y2*2)))+(MÍNIMO(5;(Z2*0,5))))
  const RPQ_MSC = Math.min(10, Math.min(10, a1a2a3a4 * 2)) + Math.min(5, b1b2b3b4 * 0.5)
  // RPG = ((((V2*W2)*8)+((X2+3)*2))/10)
  const RPG = (msc * areaFormacaoGraduacao * 8 + (conceitoCapesMestrado + 3) * 2) / 10
  // nota_primeira_fase = ((AD2*7+AC2*3)/10)
  const pontuacao = (RPG * 7 + RPQ_MSC * 3) / 10

  return {
    pontuacao,
    aprovado: pontuacao >= 5,
  }
}
