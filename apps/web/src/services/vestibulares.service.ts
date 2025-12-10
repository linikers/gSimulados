import api from "./api";

export interface IVestibular {
  _id: string;
  codigo: string;
  nome: string;
  nomeCompleto: string;
  logoUrl?: string;
  descricao: string;
  siteOficial: string;
  cidade?: string;
  estado?: string;
  proximaProva?: {
    data: string;
    inscricoes: {
      inicio: string;
      fim: string;
      status: "aberto" | "encerrado" | "em_breve";
    };
    taxa: number;
    siteInscricao: string;
  };
  ativo: boolean;
  ordem: number;
}

export const VestibularesService = {
  list: async () => {
    const response = await api.get<IVestibular[]>("/vestibulares");
    return response.data;
  },
  getByCode: async (codigo: string) => {
    const response = await api.get<IVestibular>(`/vestibulares/${codigo}`);
    return response.data;
  },
  create: async (data: Partial<IVestibular>) => {
    const response = await api.post<IVestibular>("/vestibulares", data);
    return response.data;
  },
  update: async (codigo: string, data: Partial<IVestibular>) => {
    const response = await api.put<IVestibular>(
      `/vestibulares/${codigo}`,
      data
    );
    return response.data;
  },
  delete: async (codigo: string) => {
    const response = await api.delete(`/vestibulares/${codigo}`);
    return response.data;
  },
  sync: async () => {
    const response = await api.post("/vestibulares/sync");
    return response.data;
  },
};
