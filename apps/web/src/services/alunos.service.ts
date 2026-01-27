import api from "./api";
import type { IAluno } from "@gsimulados/shared";

export const AlunosService = {
  list: async () => {
    const response = await api.get<IAluno[]>("/alunos");
    return response.data;
  },
  create: async (data: Partial<IAluno>) => {
    const response = await api.post("/alunos", data);
    return response.data;
  },
  update: async (id: string, data: Partial<IAluno>) => {
    const response = await api.put(`/alunos/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/alunos/${id}`);
    return response.data;
  },
};
