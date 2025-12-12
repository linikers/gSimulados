import { ProcessoSeriado } from "../types/vestibular";

export const processosSeriados: ProcessoSeriado[] = [
  {
    codigo: "pas-uem",
    nome: "PAS - UEM",
    sigla: "PAS",
    universidade: "UEM",
    descricao:
      "O Processo de Avaliação Seriada da UEM é um sistema de ingresso que avalia o estudante ao longo dos três anos do ensino médio.",
    siteOficial: "https://www.pas.uem.br/",
    fases: 3,
    duracaoAnos: 3,
    proximaProva: {
      data: "2025-10-15",
      inscricoes: {
        inicio: "2025-08-01",
        fim: "2025-09-15",
        status: "em_breve",
      },
      taxa: 100,
    },
    recursos: [
      {
        tipo: "provas",
        titulo: "Provas Anteriores",
        googleDriveUrl:
          "https://drive.google.com/drive/folders/exemplo-pas-uem",
        descricao: "Provas das três etapas dos anos anteriores",
      },
      {
        tipo: "informacoes",
        titulo: "Informações",
        googleDriveUrl:
          "https://drive.google.com/drive/folders/exemplo-pas-uem-info",
        descricao: "Editais e informações sobre o PAS",
      },
    ],
  },
  {
    codigo: "pac-unicentro",
    nome: "PAC - UNICENTRO",
    sigla: "PAC",
    universidade: "UNICENTRO",
    descricao:
      "O Processo de Avaliação Continuada da UNICENTRO avalia os estudantes durante o ensino médio.",
    siteOficial: "https://www.unicentro.br/pac/",
    fases: 3,
    duracaoAnos: 3,
    recursos: [
      {
        tipo: "provas",
        titulo: "Provas Anteriores",
        googleDriveUrl:
          "https://drive.google.com/drive/folders/exemplo-pac-unicentro",
        descricao: "Provas anteriores do PAC",
      },
      {
        tipo: "informacoes",
        titulo: "Informações",
        googleDriveUrl:
          "https://drive.google.com/drive/folders/exemplo-pac-unicentro-info",
        descricao: "Informações sobre o PAC",
      },
    ],
  },
  {
    codigo: "pss-uepg",
    nome: "PSS - UEPG",
    sigla: "PSS",
    universidade: "UEPG",
    descricao:
      "O Processo Seletivo Seriado da UEPG é uma forma de ingresso que considera o desempenho do aluno ao longo do ensino médio.",
    siteOficial: "https://www.uepg.br/pss/",
    fases: 3,
    duracaoAnos: 3,
    recursos: [
      {
        tipo: "provas",
        titulo: "Provas Anteriores",
        googleDriveUrl:
          "https://drive.google.com/drive/folders/exemplo-pss-uepg",
        descricao: "Provas anteriores do PSS",
      },
      {
        tipo: "informacoes",
        titulo: "Informações",
        googleDriveUrl:
          "https://drive.google.com/drive/folders/exemplo-pss-uepg-info",
        descricao: "Informações sobre o PSS",
      },
    ],
  },
];

export const getSeriadoByCodigo = (
  codigo: string
): ProcessoSeriado | undefined => {
  return processosSeriados.find((s) => s.codigo === codigo);
};
