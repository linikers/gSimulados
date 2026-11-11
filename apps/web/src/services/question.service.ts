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

export interface IPaginaQuestoes {
  items: IQuestion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const QuestionService = {
  list: async (materia?: string) => {
    const params = materia ? { materia } : {};
    const response = await api.get("/questions", { params });
    return response.data as IQuestion[];
  },

  listPaginado: async (params: {
    materia?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get("/questions", { params });
    return response.data as IPaginaQuestoes;
  },

  listMaterias: async () => {
    const response = await api.get("/questions/materias");
    return response.data as string[];
  },

  getById: async (id: string) => {
    const response = await api.get(`/questions/${id}`);
    return response.data as IQuestion;
  },
};
