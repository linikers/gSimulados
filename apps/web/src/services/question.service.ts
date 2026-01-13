import api from "./api";

export interface IQuestion {
  _id: string;
  enunciado: string;
  alternativas: string[];
  respostaCorreta: string;
  materia: string;
  assunto: string;
  dificuldade: "facil" | "medio" | "dificil";
  origem: {
    vestibular: string;
    ano: number;
    prova?: string;
  };
  tags: string[];
  criadoEm: Date;
}

export const QuestionService = {
  list: async (materia?: string) => {
    const params = materia ? { materia } : {};
    const response = await api.get("/questions", { params });
    return response.data as IQuestion[];
  },

  getById: async (id: string) => {
    const response = await api.get(`/questions/${id}`);
    return response.data as IQuestion;
  },
};
