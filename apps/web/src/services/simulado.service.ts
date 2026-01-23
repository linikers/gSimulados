// import { api } from "./api";
import api from "./api";
import type { ISimulado } from "../types/simulado";

export interface SimuladoParams {
  nome: string;
  materia?: string;
  dificuldade: "facil" | "medio" | "dificil" | "misto";
  quantidade: number;
}

export const SimuladoService = {
  generate: async (data: SimuladoParams): Promise<ISimulado> => {
    const response = await api.post("/simulados/generate", data);
    return response.data;
  },

  listMySimulados: async (): Promise<ISimulado[]> => {
    const response = await api.get("/simulados/my");
    return response.data;
  },

  getById: async (id: string): Promise<ISimulado> => {
    const response = await api.get(`/simulados/${id}`);
    return response.data;
  },
};
