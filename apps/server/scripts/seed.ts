import "dotenv/config";

import { db, type InsertUser, Users } from "../src/database";
import bcrypt from "bcryptjs";

const passwordHash = await bcrypt.hash("senha123", 10);

const UserData: InsertUser[] = [
  {
    passwordHash: passwordHash,
    email: "antonio.apolinario@ufba.br",
    nome: "Antônio Lopes Apolinário Junior",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Doutorado em Engenharia de Sistemas e Computação — Universidade Federal do Rio de Janeiro, UFRJ, 2004",
    matricula: "123",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "TEACHER",
    areas: ["CVIS"],
  },
  {
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "bruno.ps@ufba.br",
    nome: "Bruno Pereira dos Santos",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Doutorado em Ciências da Computação — Universidade Federal de Minas Gerais, UFMG, 2019. Redes de Computadores e Sistemas Distribuídos, Universidade Federal da Bahia, 2020.",
    matricula: "123",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "TEACHER",
    areas: ["RCSD"],
  },
  {
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "prazeres@ufba.br",
    nome: "Cássio Vinicius Serafim Prazeres",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Pós Doutorado em Internet das Coisas, National University of Ireland, Galway, 2015 Doutorado em Ciência da Computação, USP/ICMC, 2009 Mestrado em Ciência da Computação - Universidade Salvador, UNIFACS, 2003 Bacharel em Ciência da Computação - Universidade Salvador, UNIFACS, 2000",
    matricula: "123",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "TEACHER",
    areas: ["CD", "RCSD"],
  },
  {
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "dclaro@ufba.br",
    nome: "Daniela Barreiro Claro",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Doutora em Ciência da Computação, Université d'Angers - França, 2006",
    matricula: "123",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "TEACHER",
    areas: ["SIBW"],
  },
  {
    academicTitle:
      "Pós-Doutorado University of California, Irvine, UCI, Estados Unidos, 2019. Pós-Doutorado Virginia Polytech Institute and State University, Virgina Tech, Estados Unidos, 2008. Doutorado em Ciências da Computação  Universidade Federal de Pernambuco, UFPE, 2007. Mestrado em Ciência da Computação  Universidade Federal de São Carlos, UFSCAR, 2003. Graduação em Ciência da Computação  Universidade Salvador, UNIFACS, 2000.",
    school: "Universidade Federal da Bahia",
    matricula: "123",
    email: "eduardo.almeida@ufba.br",
    nome: "Eduardo Santana de Almeida",
    role: "TEACHER",
    areas: ["ES"],
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
  },
  {
    passwordHash:
      "$2b$10$e19ALK1zwD2lFD5/kIuTieluwwmhxxYb7T2lGjHVcrDUfYtIWyGQ.", // senha: senha123
    email: "fdurao@ufba.br",
    nome: "Frederico Araújo Durão",
    school: "Universidade Federal da Bahia",
    academicTitle: "Bacharelado",
    matricula: "123",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "TEACHER",
    areas: ["SIBW"],
  },
  {
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "gmlima@ufba.br",
    nome: "George Marconi de Araújo Lima",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Pós-Doutorado  Universidade Federal de Pernambuco, UFPE, 2016. Doutorado em Ciência da Computação  University of York, Inglaterra, 2003. Mestrado em Ciência da Computação  Universidade Estadual de Campinas, UNICAMP, 1996. Bacharelado em Ciência da Computação  Universidade Federal da Bahia, UFBA, 1993.",
    matricula: "123",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "TEACHER",
    areas: ["ICOT", "SCTR"],
  },
  {
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "gustavobf@ufba.br",
    nome: "Gustavo Bittencourt Figueiredo",
    school: "Universidade Federal da Bahia",
    academicTitle: "Doutor em Ciência da Computação, IC-UNICAMP, 2009",
    matricula: "123",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "TEACHER",
    areas: ["CD", "RCSD"],
  },
  {
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "islame.felipe@ufba.br",
    nome: "Islame Felipe da Costa Fernandes",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Doutorado em Ciência da Computação (PPgSC/UFRN, 2022) Mestrado em Sistemas e Computação (PPgSC/UFRN, 2018) Bacharelado em Ciência da Computação (UFRN, 2016)",
    matricula: "123",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "TEACHER",
    areas: ["ICOT"],
  },
  {
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "ivanmachado@dcc.ufba.br",
    nome: "Ivan do Carmo Machado",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Pós-Doutor em Engenharia de Software, UFBA, 2015 Doutor em Ciência da Computação, UFBA, 2014 Doutorado Sanduíche, Clemson University, EUA, 2012",
    matricula: "123",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "TEACHER",
    areas: ["ES"],
  },
  {
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "lrebouca@ufba.br",
    nome: "Luciano Rebouças de Oliveira",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Post-Doctorate  Federal University of Bahia, UFBA, 2012.  PhD in Electrical and Computer Engineering  University of Coimbra, UC, Portugal, 2010.  Master in Mechatronics  Federal University of Bahia, UFBA, 2005.  Graduation in Computer Science  Federal University of Bahia, UFBA, 1997.",
    matricula: "123",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "TEACHER",
    areas: ["CVIS"],
  },
  {
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
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "maycon.leone@ufba.br",
    nome: "Maycon Leone Maciel Peixoto",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Pós-Doutorado  Universidade Estadual de Campinas, UNICAMP, 2020. Doutorado em Ciências da Computação e Matemática Computacional Universidade de São Paulo, USP, 2012. Mestrado em Ciências da Computação e Matemática Computacional  Universidade de São Paulo, USP, 2008. Graduação em Bacharel em Ciência da Computação  Instituto Ensinar Brasil, FIC, 2005.",
    matricula: "123",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "TEACHER",
    areas: ["CD"],
  },
  {
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
  {
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
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "tatianenogueira@ufba.br",
    nome: "Tatiane Nogueira Rios",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Pós-Doutora em Ciências da Computação e Matemática Computacional, ICMC - USP, 2020 Doutora em Ciências da Computação e Matemática Computacional, ICMC - USP, 2013 Doutorado sanduíche, McGill University (Montreal - Canadá), 2012  Mestrado em Ciência da Computação  Universidade Federal de São Carlos, UFSCAR, 2008.  Graduação em Ciência da Computação Universidade Estadual do Sudoeste da Bahia, UESB, 2006.",
    matricula: "123",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "TEACHER",
    areas: ["ICOT"],
  },

  {
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "visitante@gmail.com", // sem email por enquanto
    matricula: "123",
    nome: "Eduardo Vieira Queiroga",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Graduação em Ciência da Computação pela Universidade Federal da Paraíba (2014), mestrado em Informática pela mesma instituição (2017), doutorado em Computação pelo Instituto de Computação da Universidade Federal Fluminense (UFF), pós-doutorado no Centre de Recherche Inria Bordeaux - Sud-Ouest (2022), e pós-doutorado no Centro de Informática (CI) da Universidade Federal da Paraíba (2026). ",
    role: "TEACHER",
    areas: ["ICOT"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    passwordHash:
      "$2y$13$wT/lWjkyz31VlxSPLAH/f.HK6eU04r5f3GYxLGuag6Afw1M.IxrVW",
    email: "visitante1@gmail.com", // sem email por enquanto
    matricula: "123",
    nome: "Vinícius Brito Cardoso",
    school: "Universidade Federal da Bahia",
    academicTitle:
      "Bacharel em Ciência da Computação pela Universidade Estadual do Sudoeste da Bahia- UESB, Mestre em informática pela Universidade Federal do Espirito Santo - UFES, Doutor em Ciência da Computação pela UFES. ",
    role: "TEACHER",
    areas: ["ICOT"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  /*
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
  */
];

async function seed() {
  await db.transaction(async (db) => {
    console.log("Seeding users...");
    const insertedUsers = await db
      .insert(Users)
      .values(UserData)
      .returning({ id: Users.id });
  });
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
