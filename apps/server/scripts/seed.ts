import "dotenv/config";

import {
  CandidatoDoutorado,
  CandidatoMestrado,
  Cursos,
  db,
  Endereco,
  type InsertCurso,
  type InsertUser,
  NotaDoutorado,
  NotaMestrado,
  Users,
} from "../src/database";

const cursosData: InsertCurso[] = [
  { id: 1, nome: "Ciência da Computação", sigla: "BCC" },
  { id: 2, nome: "Sistemas de Informação", sigla: "BSI" },
];

const UserData: InsertUser[] = [
  {
    id: 1,
    passwordHash:
      "$2b$10$e19ALK1zwD2lFD5/kIuTieluwwmhxxYb7T2lGjHVcrDUfYtIWyGQ.", // senha: senha123
    email: "professor.teste@example.com",
    nome: "Professor Teste",
    school: "Instituto de Computação",
    academicTitle: "Doutor",
    matricula: "000001",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "TEACHER",
  },
];

async function seed() {
  await db.transaction(async (db) => {
    console.log("Seeding cursos...");
    await db.insert(Cursos).values(cursosData).onConflictDoNothing();
    console.log(`Seeded ${cursosData.length} cursos.`);

    console.log("Seeding usuarios...");
    await db.insert(Users).values(UserData).onConflictDoNothing();
    console.log(`Seeded ${UserData.length} usuarios.`);

    console.log("Seeding candidatos...");

    const [endereco1] = await db
      .insert(Endereco)
      .values({
        cep: "40000-000",
        logradouro: "Rua Teste",
        numero: "10",
        bairro: "Bairro Teste",
        estado: "Bahia",
        municipio: "Salvador",
      })
      .returning({ id: Endereco.id });

    const [endereco2] = await db
      .insert(Endereco)
      .values({
        cep: "40000-000",
        logradouro: "Rua A",
        numero: "50",
        bairro: "Pituba",
        estado: "Bahia",
        municipio: "Salvador",
      })
      .returning({ id: Endereco.id });

    const [endereco3] = await db
      .insert(Endereco)
      .values({
        cep: "40000-001",
        logradouro: "Rua B",
        numero: "100",
        bairro: "Ondina",
        estado: "Bahia",
        municipio: "Salvador",
      })
      .returning({ id: Endereco.id });

    const [endereco4] = await db
      .insert(Endereco)
      .values({
        cep: "13000-000",
        logradouro: "Av. Brasil",
        numero: "200",
        bairro: "Jardim",
        estado: "São Paulo",
        municipio: "Campinas",
      })
      .returning({ id: Endereco.id });

    const [candidatoMestrado1] = await db
      .insert(CandidatoMestrado)
      .values({
        numeroInscricao: "TEST-001",
        status: "Inscricao Submetida",
        dataInscricao: new Date(),
        cpf: "12345678901",
        sexo: "Masculino",
        nome: "João Silva",
        estadoCivil: "Solteiro",
        email: "joao@example.com",
        dataNascimento: new Date("1995-01-15"),
        raca: "Branco",
        nomeMae: "Maria Silva",
        tipoEscolaEnsinoMedio: "Publica",
        pais: "Brasil",
        estado: "Bahia",
        municipio: "Salvador",
        rg: "1234567",
        orgaoExpedidor: "SSP",
        estadoExpedicao: "Bahia",
        dataExpedicao: new Date("2020-01-01"),
        tituloEleitor: "123456789",
        secaoEleitoral: "001",
        idEndereco: endereco1.id,
        telefoneCelular: "71999999999",
        linhaPesquisa: "Inteligência Artificial",
        comprovantePagTaxaInscricao: "link.pdf",
        copiaCPF: "link.pdf",
        copiaDocumentoIdentificacao: "link.pdf",
        solicitouIsencaoTaxaInscricao: false,
        comprovacaoPesquisas: "link.pdf",
        possuiNecessidadesEspeciais: false,
        vagasNegrosPardos: false,
        vagasSupranumerarias: false,
        copiaDiplomaGraduacao: "link.pdf",
        historicoGraduacao: "link.pdf",
        nomeUniversidadeGraduacao: "UFBA",
        nomeCursoGraduacao: "Ciência da Computação",
        cidadeOndeRealizouGraduacao: "Salvador",
        enadeDoCursoGraduacao: "2019",
        valorDoEnadeDoCursoGraduacao: "3.5",
        primeiraAreaPreferencia: "ES - Engenharia de Software",
        cartaMotivacao: "link.pdf",
      })
      .onConflictDoNothing()
      .returning({ id: CandidatoMestrado.id });
    console.log("Seeded candidato mestrado 1.");

    if (candidatoMestrado1) {
      await db
        .insert(NotaMestrado)
        .values({ idCandidato: candidatoMestrado1.id })
        .onConflictDoNothing();
    }

    const [candidatoMestrado2] = await db
      .insert(CandidatoMestrado)
      .values({
        numeroInscricao: "MEST-2024-001",
        status: "Inscricao Submetida",
        dataInscricao: new Date(),
        cpf: "11122233344",
        sexo: "Masculino",
        nome: "Carlos Eduardo Souza",
        estadoCivil: "Solteiro",
        email: "carlos.souza@email.com",
        dataNascimento: new Date("1998-05-10"),
        raca: "Branco",
        nomeMae: "Maria Souza",
        tipoEscolaEnsinoMedio: "Publica",
        pais: "Brasil",
        estado: "Bahia",
        municipio: "Salvador",
        rg: "12345678",
        orgaoExpedidor: "SSP",
        estadoExpedicao: "BA",
        dataExpedicao: new Date("2015-06-20"),
        tituloEleitor: "111122223333",
        secaoEleitoral: "010",
        idEndereco: endereco2.id,
        telefoneCelular: "71999998888",
        linhaPesquisa: "Inteligência Artificial",
        comprovantePagTaxaInscricao: "pdf1.pdf",
        copiaCPF: "pdf2.pdf",
        copiaDocumentoIdentificacao: "pdf3.pdf",
        comprovacaoPesquisas: "pdf4.pdf",
        copiaDiplomaGraduacao: "pdf5.pdf",
        historicoGraduacao: "pdf6.pdf",
        nomeUniversidadeGraduacao: "UFBA",
        nomeCursoGraduacao: "Ciência da Computação",
        cidadeOndeRealizouGraduacao: "Salvador",
        enadeDoCursoGraduacao: "2022",
        valorDoEnadeDoCursoGraduacao: "4.5",
        primeiraAreaPreferencia:
          "ICOT - Inteligência Computacional e Otimização",
        cartaMotivacao: "carta.pdf",
      })
      .onConflictDoNothing()
      .returning({ id: CandidatoMestrado.id });
    console.log("Seeded candidato mestrado 2.");

    if (candidatoMestrado2) {
      await db
        .insert(NotaMestrado)
        .values({ idCandidato: candidatoMestrado2.id })
        .onConflictDoNothing();
    }

    const [candidatoDoutorado1] = await db
      .insert(CandidatoDoutorado)
      .values({
        numeroInscricao: "DOUT-2024-001",
        status: "Inscricao Submetida",
        dataInscricao: new Date(),
        cpf: "99988877766",
        sexo: "Masculino",
        nome: "Ricardo Santos",
        estadoCivil: "Casado",
        email: "ricardo.santos@email.com",
        dataNascimento: new Date("1990-03-15"),
        raca: "Branco",
        nomeMae: "Helena Santos",
        tipoEscolaEnsinoMedio: "Publica",
        pais: "Brasil",
        estado: "Bahia",
        municipio: "Salvador",
        rg: "11223344",
        orgaoExpedidor: "SSP",
        estadoExpedicao: "BA",
        dataExpedicao: new Date("2010-01-10"),
        tituloEleitor: "999988887777",
        secaoEleitoral: "005",
        idEndereco: endereco3.id,
        telefoneCelular: "71977776666",
        linhaPesquisa: "Redes e Segurança",
        comprovantePagTaxaInscricao: "pdf1.pdf",
        copiaCPF: "pdf2.pdf",
        copiaDocumentoIdentificacao: "pdf3.pdf",
        comprovacaoPesquisas: "pdf4.pdf",
        historicoGraduacao: "grad.pdf",
        copiaDiplomaMestrado: "mestrado.pdf",
        historicoMestrado: "hist_mest.pdf",
        nomeUniversidadeMestrado: "UFPE",
        nomeCursoMestrado: "Ciência da Computação",
        anteprojetoTese: "tese.pdf",
        primeiraOpcaoOrientador: "Prof. Dr. Fulano",
        segundaOpcaoOrientador: "Prof. Dr. Beltrano",
        terceiraOpcaoOrientador: "Prof. Dr. Sicrano",
      })
      .onConflictDoNothing()
      .returning({ id: CandidatoDoutorado.id });
    console.log("Seeded candidato doutorado 1.");

    if (candidatoDoutorado1) {
      await db
        .insert(NotaDoutorado)
        .values({ idCandidato: candidatoDoutorado1.id })
        .onConflictDoNothing();
    }

    const [candidatoDoutorado2] = await db
      .insert(CandidatoDoutorado)
      .values({
        numeroInscricao: "DOUT-2024-002",
        status: "Inscricao Submetida",
        dataInscricao: new Date(),
        cpf: "00011122233",
        sexo: "Feminino",
        nome: "Mariana Costa",
        estadoCivil: "Solteiro",
        email: "mariana.costa@email.com",
        dataNascimento: new Date("1992-08-30"),
        raca: "Amarelo",
        nomeMae: "Lucia Costa",
        tipoEscolaEnsinoMedio: "Publica",
        pais: "Brasil",
        estado: "São Paulo",
        municipio: "Campinas",
        rg: "55667788",
        orgaoExpedidor: "SSP",
        estadoExpedicao: "SP",
        dataExpedicao: new Date("2012-05-20"),
        tituloEleitor: "000011112222",
        secaoEleitoral: "015",
        idEndereco: endereco4.id,
        telefoneCelular: "19999990000",
        linhaPesquisa: "Ciência de Dados",
        comprovantePagTaxaInscricao: "pdf1.pdf",
        copiaCPF: "pdf2.pdf",
        copiaDocumentoIdentificacao: "pdf3.pdf",
        comprovacaoPesquisas: "pdf4.pdf",
        historicoGraduacao: "grad.pdf",
        copiaDiplomaMestrado: "mestrado.pdf",
        historicoMestrado: "hist_mest.pdf",
        nomeUniversidadeMestrado: "UNICAMP",
        nomeCursoMestrado: "Engenharia Elétrica",
        anteprojetoTese: "tese.pdf",
        primeiraOpcaoOrientador: "Prof. Dr. Orientador A",
        segundaOpcaoOrientador: "Prof. Dr. Orientador B",
        terceiraOpcaoOrientador: "Prof. Dr. Orientador C",
      })
      .onConflictDoNothing()
      .returning({ id: CandidatoDoutorado.id });
    console.log("Seeded candidato doutorado 2.");

    if (candidatoDoutorado2) {
      await db
        .insert(NotaDoutorado)
        .values({ idCandidato: candidatoDoutorado2.id })
        .onConflictDoNothing();
    }
  });
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
