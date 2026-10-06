export interface IQuestion {
  _id: string;
  enunciado: string;
  alternativas: string[];
  respostaCorreta: string;
  materia: string;
  assunto: string;
  dificuldade: "facil" | "medio" | "dificil";
  temImagem?: boolean;
  imagemUrl?: string;
  imagemBbox?: { x: number; y: number; w: number; h: number };
  imagemDescricao?: string;
  imagemLargura?: number;
  imagemAltura?: number;
}

export interface ISimulado {
  _id: string;
  nome: string;
  questoes: IQuestion[] | string[];
  materia?: string;
  dificuldade: "facil" | "medio" | "dificil" | "misto";
  quantidadeQuestoes: number;
  usuario: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface IRespostaCorrigida {
  questaoId: string;
  respostaSelecionada: string;
  correta: boolean;
  respostaCorreta: string;
  enunciado: string;
  alternativas: string[];
  imagemUrl?: string;
  imagemBbox?: { x: number; y: number; w: number; h: number };
  imagemDescricao?: string;
  imagemLargura?: number;
  imagemAltura?: number;
}

export interface IResultadoSimulado {
  simuladoId: string;
  total: number;
  acertos: number;
  erros: number;
  percentual: number;
  respostas: IRespostaCorrigida[];
}
