import api from "./api";
import type {
  IPlano,
  IPixPublico,
  IPagamento,
  ICheckoutResponse,
  IPixConfig,
} from "../types/pagamento";

export const PagamentosService = {
  listarPlanos: async (): Promise<IPlano[]> => {
    const response = await api.get("/pagamentos/planos");
    return response.data;
  },

  getPixPublico: async (): Promise<IPixPublico> => {
    const response = await api.get("/pagamentos/pix");
    return response.data;
  },

  checkout: async (plano: string): Promise<ICheckoutResponse> => {
    const response = await api.post("/pagamentos/checkout", { plano });
    return response.data;
  },

  meusPagamentos: async (): Promise<IPagamento[]> => {
    const response = await api.get("/pagamentos/meus");
    return response.data;
  },

  listarTodos: async (): Promise<IPagamento[]> => {
    const response = await api.get("/pagamentos");
    return response.data;
  },

  confirmar: async (id: string): Promise<IPagamento> => {
    const response = await api.post(`/pagamentos/${id}/confirmar`);
    return response.data;
  },

  getPixConfig: async (): Promise<IPixConfig | null> => {
    const response = await api.get("/pagamentos/config");
    return response.data;
  },

  salvarPixConfig: async (data: Partial<IPixConfig>): Promise<IPixConfig> => {
    const response = await api.put("/pagamentos/config", data);
    return response.data;
  },
};
