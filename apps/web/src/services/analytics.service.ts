import api from "./api";

export interface IResumoAnalytics {
  usuarios: { alunos: number; escolas: number };
  questoes: {
    total: number;
    porVestibular: { vestibular: string; total: number }[];
  };
  extracao: {
    pendentes: number;
    aprovadas: number;
    rejeitadas: number;
    pdfsProcessados: number;
    pdfsComErro: number;
  };
  simulados: { total: number; tentativas: number; ultimos30: number };
  assinaturasAtivas: number;
  receita: {
    total: number;
    ultimos30: number;
    pagamentosConfirmados: number;
    pendentes: number;
  };
}

export const AnalyticsService = {
  resumo: async (): Promise<IResumoAnalytics> => {
    const resposta = await api.get("/admin/analytics/resumo");
    return resposta.data;
  },
};
