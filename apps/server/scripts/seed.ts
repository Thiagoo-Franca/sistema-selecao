import "dotenv/config";

import {
  CandidatoDoutorado,
  CandidatoMestrado,
  // Cursos,
  db,
  // Endereco,
  // type InsertCurso,
  type InsertUser,
  NotaDoutorado,
  NotaMestrado,
  Users,
} from "../src/database";
import bcrypt from "bcryptjs";

/*
const cursosData: InsertCurso[] = [
  { id: 1, nome: "Ciência da Computação", sigla: "BCC" },
  { id: 2, nome: "Sistemas de Informação", sigla: "BSI" },
];
*/
const passwordHash = await bcrypt.hash("admin@admin.com", 10);

const UserData: InsertUser[] = [
  {
    id: 91,
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "prazeres@ufba.br",
    nome: "Cássio Vinicius Serafim Prazeres",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Pós Doutorado em Internet das Coisas, National University of Ireland, Galway, 2015 Doutorado em Ciência da Computação, USP/ICMC, 2009 Mestrado em Ciência da Computação - Universidade Salvador, UNIFACS, 2003 Bacharel em Ciência da Computação - Universidade Salvador, UNIFACS, 2000",
    matricula: "123",
    createdAt: new Date("2023-08-09 11:16:17"),
    updatedAt: new Date("2023-08-09 11:16:17"),
    role: "TEACHER",
    areas: ["CD", "RCSD"],
  },
  {
    id: 87,
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "dclaro@ufba.br",
    nome: "Daniela Barreiro Claro",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Doutora em Ciência da Computação, Université d'Angers - França, 2006",
    matricula: "123",
    createdAt: new Date("2023-08-09 11:16:17"),
    updatedAt: new Date("2023-08-09 11:16:17"),
    role: "TEACHER",
    areas: ["SIBW"],
  },
  {
    id: 85,
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "islame.felipe@ufba.br",
    nome: "Felipe Fernandes",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Doutorado em Ciência da Computação (PPgSC/UFRN, 2022) Mestrado em Sistemas e Computação (PPgSC/UFRN, 2018) Bacharelado em Ciência da Computação (UFRN, 2016)",
    matricula: "123",
    createdAt: new Date("2023-08-09 11:16:17"),
    updatedAt: new Date("2023-08-09 11:16:17"),
    role: "TEACHER",
    areas: ["ICOT"],
  },
  {
    id: 83,
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "esa@dcc.ufba.br",
    nome: "Eduardo Santana de Almeida",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Pós-Doutorado University of California, Irvine, UCI, Estados Unidos, 2019. Pós-Doutorado Virginia Polytech Institute and State University, Virgina Tech, Estados Unidos, 2008. Doutorado em Ciências da Computação  Universidade Federal de Pernambuco, UFPE, 2007. Mestrado em Ciência da Computação  Universidade Federal de São Carlos, UFSCAR, 2003. Graduação em Ciência da Computação  Universidade Salvador, UNIFACS, 2000.",
    matricula: "123",
    createdAt: new Date("2023-08-09 11:16:17"),
    updatedAt: new Date("2023-08-09 11:16:17"),
    role: "TEACHER",
    areas: ["ES"],
  },
  {
    id: 81,
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "ivanmachado@dcc.ufba.br",
    nome: "Ivan do Carmo Machado",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Pós-Doutor em Engenharia de Software, UFBA, 2015 Doutor em Ciência da Computação, UFBA, 2014 Doutorado Sanduíche, Clemson University, EUA, 2012",
    matricula: "123",
    createdAt: new Date("2023-08-09 11:16:17"),
    updatedAt: new Date("2023-08-09 11:16:17"),
    role: "TEACHER",
    areas: ["ES"],
  },
  {
    id: 79,
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "gustavobf@ufba.br",
    nome: "Gustavo Bittencourt Figueiredo",
    school: "Universidade Federal da Bahia",
    academicTitle: "Doutor em Ciência da Computação, IC-UNICAMP, 2009",
    matricula: "123",
    createdAt: new Date("2023-08-09 11:16:17"),
    updatedAt: new Date("2023-08-09 11:16:17"),
    role: "TEACHER",
    areas: ["CD", "RCSD"],
  },
  {
    id: 76,
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "gmlima@ufba.br",
    nome: "George Marconi de Araújo Lima",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Pós-Doutorado  Universidade Federal de Pernambuco, UFPE, 2016. Doutorado em Ciência da Computação  University of York, Inglaterra, 2003. Mestrado em Ciência da Computação  Universidade Estadual de Campinas, UNICAMP, 1996. Bacharelado em Ciência da Computação  Universidade Federal da Bahia, UFBA, 1993.",
    matricula: "123",
    createdAt: new Date("2023-08-09 11:16:17"),
    updatedAt: new Date("2023-08-09 11:16:17"),
    role: "TEACHER",
    areas: ["ICOT", "SCTR"],
  },
  {
    id: 74,
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "tatianenogueira@ufba.br",
    nome: "Tatiane Nogueira Rios",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Pós-Doutora em Ciências da Computação e Matemática Computacional, ICMC - USP, 2020 Doutora em Ciências da Computação e Matemática Computacional, ICMC - USP, 2013 Doutorado sanduíche, McGill University (Montreal - Canadá), 2012  Mestrado em Ciência da Computação  Universidade Federal de São Carlos, UFSCAR, 2008.  Graduação em Ciência da Computação Universidade Estadual do Sudoeste da Bahia, UESB, 2006.",
    matricula: "123",
    createdAt: new Date("2023-08-09 11:16:17"),
    updatedAt: new Date("2023-08-09 11:16:17"),
    role: "TEACHER",
    areas: ["ICOT"],
  },
  {
    id: 73,
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "lrebouca@ufba.br",
    nome: "Luciano Rebouças de Oliveira",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Post-Doctorate  Federal University of Bahia, UFBA, 2012.  PhD in Electrical and Computer Engineering  University of Coimbra, UC, Portugal, 2010.  Master in Mechatronics  Federal University of Bahia, UFBA, 2005.  Graduation in Computer Science  Federal University of Bahia, UFBA, 1997.",
    matricula: "123",
    createdAt: new Date("2023-08-09 11:16:17"),
    updatedAt: new Date("2023-08-09 11:16:17"),
    role: "TEACHER",
    areas: ["CVIS"],
  },
  {
    id: 68,
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "maycon.leone@ufba.br",
    nome: "Maycon Leone Maciel Peixoto",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Pós-Doutorado  Universidade Estadual de Campinas, UNICAMP, 2020. Doutorado em Ciências da Computação e Matemática Computacional Universidade de São Paulo, USP, 2012. Mestrado em Ciências da Computação e Matemática Computacional  Universidade de São Paulo, USP, 2008. Graduação em Bacharel em Ciência da Computação  Instituto Ensinar Brasil, FIC, 2005.",
    matricula: "123",
    createdAt: new Date("2023-08-09 11:16:17"),
    updatedAt: new Date("2023-08-09 11:16:17"),
    role: "TEACHER",
    areas: ["CD"],
  },
  {
    id: 67,
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "manoel.mendonca@ufba.br",
    nome: "Manoel Gomes de Mendonça Neto",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Pós-Doutorado Universidade de Maryland Em College Park, UMCP, Estados Unidos, 1998.  Doutorado em Ciência da Computação Universidade de Maryland Em College Park, UMCP, Estados Unidos, 1997.  Mestrado em Engenharia de Computação e Automação Industrial Universidade Estadual de Campinas, UNICAMP, 1990.  Graduação em Engenharia Elétrica, op. Eletrônica Universidade Federal da Bahia, UFBA, 1986.",
    matricula: "123",
    createdAt: new Date("2023-08-09 11:16:17"),
    updatedAt: new Date("2023-08-09 11:16:17"),
    role: "TEACHER",
    areas: ["ICOT", "ES"],
  },
  {
    id: 66,
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "melo@dcc.ufba.br",
    nome: "Rafael Augusto de Melo",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Pós-Doutorado Universidade Federal Fluminense, UFF, 2014. Doutorado em Ciências da Engenharia (Matemática Aplicada) Université Catholique de Louvain, UCL, Bélgica, 2011. Mestrado em Computação  Universidade Federal Fluminense, UFF, 2007. Graduação em Ciência da Computação Universidade Federal de Lavras, UFLA, 2005.",
    matricula: "123",
    createdAt: new Date("2023-08-09 11:16:17"),
    updatedAt: new Date("2023-08-09 11:16:17"),
    role: "TEACHER",
    areas: ["ICOT"],
  },
  {
    id: 17,
    passwordHash:
      "$2b$10$e19ALK1zwD2lFD5/kIuTieluwwmhxxYb7T2lGjHVcrDUfYtIWyGQ.", // senha: senha123
    email: "fdurao@ufba.br",
    nome: "Frederico Araújo Durão",
    school: "Universidade Federal da Bahia",
    academicTitle: "Bacharelado",
    matricula: "123",
    createdAt: new Date("2023-11-03 13:48:56"),
    updatedAt: new Date("2023-11-03 13:48:56"),
    role: "TEACHER",
    areas: ["SIBW"],
  },
  /*
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
  {
    email: "admin@admin.com",
    nome: "Root ACTIVE",
    passwordHash,
    school: "Root",
    academicTitle: "Bacharelado",
    matricula: "123",
    role: "ADMIN",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  {
    id: 65,
    passwordHash:
      "$2b$10$e19ALK1zwD2lFD5/kIuTieluwwmhxxYb7T2lGjHVcrDUfYtIWyGQ.",
    email: "robespierre.pita@ufba.br",
    nome: "Robespierre Dantas da Rocha Pita",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Doutor em Ciência da Computação - Universidade Federal da Bahia (UFBA), 2019 Mestre em Ciência da Computação - Universidade Federal da Bahia (UFBA), 2015 Especialista em Redes de Computadores - Universidade Salvador (UNIFACS), 2010 Graduado em Sistemas de Informação - Universidade Salvador (UNIFACS), 2009",
    matricula: "123",
    role: "TEACHER",
    areas: ["ICOT"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 61,
    passwordHash:
      "$2b$10$e19ALK1zwD2lFD5/kIuTieluwwmhxxYb7T2lGjHVcrDUfYtIWyGQ.",
    email: "ritasuzana@dcc.ufba.br",
    nome: "Rita Suzana Pitangueira Maciel",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Pós-Doutorado - University of Waterloo. U.Waterloo, Canadá, 2015 Doutora em Ciência da Computação, UFPE, 2005",
    matricula: "123",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "TEACHER",
    areas: ["ES", "SIBW"],
  },
  {
    id: 63,
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
      email: "ricardoar@ufba.br",
      nome: "Ricardo Araújo Rios",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Pós-Doutorado em Ciências da Computação e Matemática Computacional, ICMC - USP, 2020 Doutor em Ciências da Computação e Matemática Computacional, ICMC - USP, 2013 Doutorado sanduíche, Université de Montréal (Montreal - CA) , 2012 Mestrado em Ciência da Computação, Universidade Federal de São Carlos. UFSCAR, 2008 Graduação em Ciência da Computação, Universidade Estadual do Sudoeste da Bahia, UESB, 2006",
    matricula: "123",
    createdAt: new Date("2023-08-09 11:16:17"),
    updatedAt: new Date("2023-08-09 11:16:17"),
    areas: ["ICOT"],
    role: "TEACHER",
  },
  */
];

async function seed() {
  await db.transaction(async (db) => {
    console.log("Seeding users...");
    const insertedUsers = await db
      .insert(Users)
      .values(UserData)
      .returning({ id: Users.id });

    /*
    const [endereco2, endereco3, endereco4] = await db
      .insert(Endereco)
      .values([
        {
          cep: "40100-000",
          logradouro: "Av. Sete de Setembro",
          numero: "250",
          bairro: "Barra",
          estado: "Bahia",
          municipio: "Salvador",
        },
        {
          cep: "44001-000",
          logradouro: "Rua das Flores",
          numero: "45",
          bairro: "Centro",
          estado: "Bahia",
          municipio: "Feira de Santana",
        },
        {
          cep: "41800-000",
          logradouro: "Rua do Sol",
          numero: "78",
          bairro: "Pituba",
          estado: "Bahia",
          municipio: "Salvador",
        },
      ])
      .returning({ id: Endereco.id });

    const candidatosExtras = [
      {
  //      idEndereco: endereco2.id,
        numeroInscricao: "TEST-002",
        cpf: "98765432100",
        sexo: "Feminino",
        nome: "Ana Souza",
        estadoCivil: "Casado",
        email: "ana@example.com",
        dataNascimento: new Date("1993-06-20"),
        raca: "Pardo",
        nomeMae: "Lúcia Souza",
        tipoEscolaEnsinoMedio: "Privada",
        rg: "2345678",
        tituloEleitor: "234567890",
        telefoneCelular: "71988888888",
        linhaPesquisa: "Banco de Dados",
        primeiraAreaPreferencia:
          "SIBW - Sistemas de Informação, Banco de Dados Web",
        nomeCursoGraduacao: "Sistemas de Informação",
        nomeUniversidadeGraduacao: "UNEB",
        enadeDoCursoGraduacao: "2018",
        valorDoEnadeDoCursoGraduacao: "4.0",
        vagasNegrosPardos: true,
        possuiNecessidadesEspeciais: false,
      },
      {
        idEndereco: endereco3.id,
        numeroInscricao: "TEST-003",
        cpf: "11122233344",
        sexo: "Masculino",
        nome: "Carlos Oliveira",
        estadoCivil: "Solteiro",
        email: "carlos@example.com",
        dataNascimento: new Date("1997-11-03"),
        raca: "Preto",
        nomeMae: "Rita Oliveira",
        tipoEscolaEnsinoMedio: "Publica",
        rg: "3456789",
        tituloEleitor: "345678901",
        telefoneCelular: "75977777777",
        linhaPesquisa: "Redes de Computadores",
        primeiraAreaPreferencia:
          "ICOT - Inteligência Computacional e Otimização",
        nomeCursoGraduacao: "Engenharia da Computação",
        nomeUniversidadeGraduacao: "UEFS",
        enadeDoCursoGraduacao: "2019",
        valorDoEnadeDoCursoGraduacao: "3.8",
        vagasNegrosPardos: true,
        possuiNecessidadesEspeciais: false,
      },
      {
        idEndereco: endereco4.id,
        numeroInscricao: "TEST-004",
        cpf: "55566677788",
        sexo: "Feminino",
        nome: "Beatriz Lima",
        estadoCivil: "Solteiro",
        email: "beatriz@example.com",
        dataNascimento: new Date("1996-03-12"),
        raca: "Branco",
        nomeMae: "Helena Lima",
        tipoEscolaEnsinoMedio: "Privada",
        rg: "4567890",
        tituloEleitor: "456789012",
        telefoneCelular: "71966666666",
        linhaPesquisa: "Visão Computacional",
        primeiraAreaPreferencia: "ES - Engenharia de Software",
        nomeCursoGraduacao: "Ciência da Computação",
        nomeUniversidadeGraduacao: "UFBA",
        enadeDoCursoGraduacao: "2020",
        valorDoEnadeDoCursoGraduacao: "4.5",
        vagasNegrosPardos: false,
        possuiNecessidadesEspeciais: true,
      },
    ] as const;

    for (const c of candidatosExtras) {
      const [candidato] = await db
        .insert(CandidatoMestrado)
        .values({
          status: "Inscricao Submetida",
          dataInscricao: new Date(),
          pais: "Brasil",
          estado: "Bahia",
          municipio: "Salvador",
          orgaoExpedidor: "SSP",
          estadoExpedicao: "Bahia",
          dataExpedicao: new Date("2020-01-01"),
          secaoEleitoral: "001",
          comprovantePagTaxaInscricao: "link.pdf",
          copiaCPF: "link.pdf",
          copiaDocumentoIdentificacao: "link.pdf",
          solicitouIsencaoTaxaInscricao: false,
          comprovacaoPesquisas: "link.pdf",
          vagasSupranumerarias: false,
          copiaDiplomaGraduacao: "link.pdf",
          historicoGraduacao: "link.pdf",
          cidadeOndeRealizouGraduacao: "Salvador",
          cartaMotivacao: "link.pdf",
          ...c,
        })
        .onConflictDoNothing()
        .returning({ id: CandidatoMestrado.id });

      if (candidato) {
        await db
          .insert(NotaMestrado)
          .values({ idCandidato: candidato.id })
          .onConflictDoNothing();
      }
    }
    console.log("Seeded candidatos mestrado 2-4.");
    */
    /*
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
    */
  });
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
