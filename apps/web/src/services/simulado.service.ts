// import { api } from "./api";
import api from "./api";

export interface SimuladoParams {
  nome: string;
  materia?: string;
  dificuldade: "facil" | "medio" | "dificil" | "misto";
  quantidade: number;
}

export const SimuladoService = {
  generate: async (data: SimuladoParams) => {
    const response = await api.post("/simulados/generate", data);
    return response.data;
  },

  listMySimulados: async () => {
    const response = await api.get("/simulados/my");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/simulados/${id}`);
    return response.data;
  },
};
