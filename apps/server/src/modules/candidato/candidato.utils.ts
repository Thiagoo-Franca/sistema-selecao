export type CandidatoMestradoNotaEtapa1 = {
    grad: number,
    area: number,
    enade: number,
    a1a2a3a4: number,
    b1b2b3b4: number,
    ic_it: number,
    poscomp: number,
    DISCIPLINA_PÓS_CAPES_6: number,
    DISCIPLINA_PÓS_CAPES_3_5: number,
}

export default function calcularMestradoNotaEtapa1({ grad, area, enade, a1a2a3a4, b1b2b3b4, ic_it, poscomp, DISCIPLINA_PÓS_CAPES_6, DISCIPLINA_PÓS_CAPES_3_5 }: CandidatoMestradoNotaEtapa1): { pontuacao: number, aprovado: boolean } {

    const RGRAD = ((((grad * area) * 7) + ((enade * 2) * 3)) / 10)

    const RPQ_GRAD = Math.min(10, Math.min(10, (a1a2a3a4 * 2)) + Math.min(5, b1b2b3b4) + Math.min(6, (ic_it * 2)) + (poscomp / 7) + Math.min(6, (DISCIPLINA_PÓS_CAPES_6 * 2)) + Math.min(4, DISCIPLINA_PÓS_CAPES_3_5))

    const pontuacao = (RGRAD * 8 + RPQ_GRAD * 2) / 10
    return { pontuacao: pontuacao, aprovado: pontuacao >= 5}
}