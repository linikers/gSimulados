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
};
