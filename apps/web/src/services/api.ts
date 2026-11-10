import axios from "axios";
import { useAssinaturaBloqueada } from "../store/useAssinaturaBloqueada";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
});

/**
 * 402 = recurso pago sem assinatura. Não é erro genérico: abre o dialog com o
 * motivo e o caminho para /planos. Marca o erro como tratado para o
 * `useErrorHandler` não jogar um toast solto por cima.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 402) {
      const data = error.response.data as
        | { mensagem?: string; error?: string }
        | undefined;
      useAssinaturaBloqueada
        .getState()
        .abrir(
          data?.mensagem ||
            "Sua assinatura não está ativa. Assine para continuar usando os simulados.",
        );
      (error as { __assinaturaTratada?: boolean }).__assinaturaTratada = true;
    }
    return Promise.reject(error);
  },
);

export default api;
