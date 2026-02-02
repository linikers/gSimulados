import api from "./api";

export interface IQuestionReview {
  _id: string;
  enunciado: string;
  alternativas: string[];
  respostaCorreta: string;
  tipoQuestao: "multipla_escolha" | "alternativa" | "somatoria";
  temGabarito: boolean;
  materia: string;
  assunto: string;
  imagemUrl?: string;
  dificuldade: "facil" | "medio" | "dificil";
  origem: {
    vestibular: string;
    ano: number;
    prova?: string;
  };
  tags?: string[];
}

export const QuestionReviewService = {
  listPending: async () => {
    const response = await api.get("/extraction/questions/pending");
    return response.data;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  approve: async (id: string, editedData: any) => {
    const response = await api.post(
      `/extraction/questions/${id}/approve`,
      editedData
    );
    return response.data;
  },

  reject: async (id: string) => {
    const response = await api.post(`/extraction/questions/${id}/reject`);
    return response.data;
  },

  audit: async (id: string) => {
    const response = await api.post(`/extraction/questions/${id}/audit`);
    return response.data;
  },
};
