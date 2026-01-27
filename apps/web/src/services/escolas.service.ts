import api from "./api";
import type { IEscola } from "@gsimulados/shared";

export const EscolasService = {
  list: async () => {
    const response = await api.get<IEscola[]>("/schools");
    return response.data;
  },
  create: async (data: Partial<IEscola>) => {
    const response = await api.post("/schools", data);
    return response.data;
  },
  update: async (id: string, data: Partial<IEscola>) => {
    const response = await api.put(`/schools/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/schools/${id}`);
    return response.data;
  },
};
