import type { Vestibular } from "../types/vestibular";

export const vestibulares: Vestibular[] = [
  {
    codigo: "enem",
    nome: "ENEM",
    nomeCompleto: "Exame Nacional do Ensino Médio",
    sigla: "ENEM",
    descricao:
      "O Exame Nacional do Ensino Médio (ENEM) é uma prova realizada pelo Ministério da Educação do Brasil utilizada para avaliar a qualidade do ensino médio no país.",
    siteOficial:
      "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem",
    cidade: "Nacional",
    estado: "BR",
    proximaProva: {
      data: "2025-11-09",
      inscricoes: {
        inicio: "2025-05-27",
        fim: "2025-06-07",
        status: "em_breve",
      },
      taxa: 85,
      siteInscricao: "https://enem.inep.gov.br/",
    },
    recursos: [
      {
        tipo: "provas",
        titulo: "Provas Anteriores",
        googleDriveUrl:
          "https://drive.google.com/drive/folders/exemplo-enem-provas",
        descricao: "Provas e gabaritos dos últimos anos",
      },
      {
        tipo: "informacoes",
        titulo: "Informações",
        googleDriveUrl:
          "https://drive.google.com/drive/folders/exemplo-enem-info",
        descricao: "Editais, cronogramas e documentos oficiais",
      },
    ],
  },
  {
    codigo: "uem",
    nome: "UEM",
    nomeCompleto: "Universidade Estadual de Maringá",
    sigla: "UEM",
    descricao:
      "A Universidade Estadual de Maringá é uma instituição pública de ensino superior do Paraná, reconhecida pela excelência acadêmica.",
    siteOficial: "https://www.uem.br/",
    cidade: "Maringá",
    estado: "PR",
    coordenadas: {
      lat: -23.4056,
      lng: -51.9389,
    },
    proximaProva: {
      data: "2025-11-23",
      inscricoes: {
        inicio: "2025-09-01",
        fim: "2025-10-15",
        status: "em_breve",
      },
      taxa: 150,
      siteInscricao: "https://www.cvuem.uem.br/",
    },
    recursos: [
      {
        tipo: "provas",
        titulo: "Provas Anteriores",
        googleDriveUrl: "https://drive.google.com/drive/folders/1YGacJ...",
        descricao: "Provas e gabaritos anteriores da UEM",
      },
      {
        tipo: "informacoes",
        titulo: "Informações",
        googleDriveUrl: "https://drive.google.com/drive/folders/1VfR88...",
        descricao: "Editais e informações sobre o vestibular",
      },
      {
        tipo: "notas_corte",
        titulo: "Notas de Corte",
        googleDriveUrl: "https://drive.google.com/drive/folders/1f5Gzq...",
        descricao: "Histórico de notas de corte por curso",
      },
      {
        tipo: "concorrencia",
        titulo: "Concorrência",
        googleDriveUrl: "https://drive.google.com/drive/folders/1FPSd_...",
        descricao: "Dados de concorrência dos últimos anos",
      },
      {
        tipo: "listas",
        titulo: "Listas Somatório",
        googleDriveUrl: "https://drive.google.com/drive/folders/17I8V...",
        descricao: "Mais de 1000 exercícios tipo somatório",
      },
    ],
  },
  {
    codigo: "uepg",
    nome: "UEPG",
    nomeCompleto: "Universidade Estadual de Ponta Grossa",
    sigla: "UEPG",
    descricao:
      "A Universidade Estadual de Ponta Grossa é uma instituição pública de ensino superior localizada em Ponta Grossa, Paraná.",
    siteOficial: "https://www.uepg.br/",
    cidade: "Ponta Grossa",
    estado: "PR",
    coordenadas: {
      lat: -25.0916,
      lng: -50.1668,
    },
    recursos: [
      {
        tipo: "provas",
        titulo: "Provas Anteriores",
        googleDriveUrl: "https://drive.google.com/drive/folders/exemplo-uepg",
        descricao: "Provas e gabaritos anteriores",
      },
      {
        tipo: "informacoes",
        titulo: "Informações",
        googleDriveUrl:
          "https://drive.google.com/drive/folders/exemplo-uepg-info",
        descricao: "Informações sobre o vestibular",
      },
    ],
  },
  {
    codigo: "unicentro",
    nome: "UNICENTRO",
    nomeCompleto: "Universidade Estadual do Centro-Oeste",
    sigla: "UNICENTRO",
    descricao:
      "A Universidade Estadual do Centro-Oeste é uma instituição pública de ensino superior com campus em Guarapuava e Irati.",
    siteOficial: "https://www.unicentro.br/",
    cidade: "Guarapuava",
    estado: "PR",
    coordenadas: {
      lat: -25.3914,
      lng: -51.4617,
    },
    recursos: [
      {
        tipo: "provas",
        titulo: "Provas Anteriores",
        googleDriveUrl:
          "https://drive.google.com/drive/folders/exemplo-unicentro",
        descricao: "Provas e gabaritos anteriores",
      },
      {
        tipo: "informacoes",
        titulo: "Informações",
        googleDriveUrl:
          "https://drive.google.com/drive/folders/exemplo-unicentro-info",
        descricao: "Informações sobre o vestibular",
      },
    ],
  },
  {
    codigo: "uel",
    nome: "UEL",
    nomeCompleto: "Universidade Estadual de Londrina",
    sigla: "UEL",
    descricao:
      "A Universidade Estadual de Londrina é uma das maiores e mais importantes universidades do Paraná.",
    siteOficial: "https://www.uel.br/",
    cidade: "Londrina",
    estado: "PR",
    coordenadas: {
      lat: -23.3105,
      lng: -51.1628,
    },
    recursos: [
      {
        tipo: "provas",
        titulo: "Provas Anteriores",
        googleDriveUrl: "https://drive.google.com/drive/folders/exemplo-uel",
        descricao: "Provas e gabaritos anteriores",
      },
      {
        tipo: "informacoes",
        titulo: "Informações",
        googleDriveUrl:
          "https://drive.google.com/drive/folders/exemplo-uel-info",
        descricao: "Informações sobre o vestibular",
      },
    ],
  },
  {
    codigo: "ufpr",
    nome: "UFPR",
    nomeCompleto: "Universidade Federal do Paraná",
    sigla: "UFPR",
    descricao:
      "A Universidade Federal do Paraná é a mais antiga universidade do Brasil, fundada em 1912.",
    siteOficial: "https://www.ufpr.br/",
    cidade: "Curitiba",
    estado: "PR",
    coordenadas: {
      lat: -25.4489,
      lng: -49.2311,
    },
    recursos: [
      {
        tipo: "provas",
        titulo: "Provas Anteriores",
        googleDriveUrl: "https://drive.google.com/drive/folders/exemplo-ufpr",
        descricao: "Provas e gabaritos anteriores",
      },
      {
        tipo: "informacoes",
        titulo: "Informações",
        googleDriveUrl:
          "https://drive.google.com/drive/folders/exemplo-ufpr-info",
        descricao: "Informações sobre o vestibular",
      },
    ],
  },
  {
    codigo: "unioeste",
    nome: "UNIOESTE",
    nomeCompleto: "Universidade Estadual do Oeste do Paraná",
    sigla: "UNIOESTE",
    descricao:
      "A Universidade Estadual do Oeste do Paraná possui campus em diversas cidades do oeste paranaense.",
    siteOficial: "https://www.unioeste.br/",
    cidade: "Cascavel",
    estado: "PR",
    coordenadas: {
      lat: -24.9555,
      lng: -53.4552,
    },
    recursos: [
      {
        tipo: "provas",
        titulo: "Provas Anteriores",
        googleDriveUrl:
          "https://drive.google.com/drive/folders/exemplo-unioeste",
        descricao: "Provas e gabaritos anteriores",
      },
      {
        tipo: "informacoes",
        titulo: "Informações",
        googleDriveUrl:
          "https://drive.google.com/drive/folders/exemplo-unioeste-info",
        descricao: "Informações sobre o vestibular",
      },
    ],
  },
];

export const getVestibularByCodigo = (
  codigo: string
): Vestibular | undefined => {
  return vestibulares.find((v) => v.codigo === codigo);
};
