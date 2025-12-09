import api from "./api";

export interface IQuestionForm {
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
  tags?: string[];
}

export const QuestionsService = {
  create: async (data: IQuestionForm) => {
    const response = await api.post("/questions", data);
    return response.data;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list: async (filters?: any) => {
    const response = await api.get("/questions", { params: filters });
    return response.data;
  },
};
