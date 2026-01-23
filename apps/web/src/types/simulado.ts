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
