import api from "./api";

export type Gateway = "mercadopago" | "pagbank";

export interface IGatewayStatus {
  gateway: Gateway;
  configurado: boolean;
  origem: "painel" | "ambiente" | "nenhum";
  tokenMascarado: string;
  atualizadoEm: string | null;
  atualizadoPor: string | null;
}

export const GatewaysService = {
  status: async (): Promise<IGatewayStatus[]> => {
    const resposta = await api.get("/admin/gateways");
    return resposta.data;
  },

  salvar: async (
    gateway: Gateway,
    credenciais: Record<string, string>,
  ): Promise<void> => {
    await api.put(`/admin/gateways/${gateway}`, credenciais);
  },

  remover: async (gateway: Gateway): Promise<void> => {
    await api.delete(`/admin/gateways/${gateway}`);
  },
};
