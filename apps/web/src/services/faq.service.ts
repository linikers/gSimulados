import api from "./api";

export type FaqCategoria = "escola" | "aluno" | "geral";

export interface IFaq {
  _id: string;
  pergunta: string;
  resposta: string;
  categoria: FaqCategoria;
  ordem: number;
  publicado: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface FaqPayload {
  pergunta: string;
  resposta: string;
  categoria: FaqCategoria;
  ordem: number;
  publicado: boolean;
}

export const FaqService = {
  publico: async (): Promise<IFaq[]> => {
    const resposta = await api.get("/faq");
    return resposta.data;
  },

  listarAdmin: async (): Promise<IFaq[]> => {
    const resposta = await api.get("/faq/admin");
    return resposta.data;
  },

  criar: async (dados: FaqPayload): Promise<IFaq> => {
    const resposta = await api.post("/faq/admin", dados);
    return resposta.data;
  },

  atualizar: async (id: string, dados: FaqPayload): Promise<IFaq> => {
    const resposta = await api.put(`/faq/admin/${id}`, dados);
    return resposta.data;
  },

  remover: async (id: string): Promise<void> => {
    await api.delete(`/faq/admin/${id}`);
  },

  seed: async (): Promise<{ criados: number }> => {
    const resposta = await api.post("/faq/admin/seed");
    return resposta.data;
  },
};
