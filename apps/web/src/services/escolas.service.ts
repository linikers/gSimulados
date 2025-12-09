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
};
