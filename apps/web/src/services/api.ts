import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAssinaturaBloqueada } from "../store/useAssinaturaBloqueada";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
});

const TOKEN_KEY = "@gSimulados:token";
const REFRESH_KEY = "@gSimulados:refreshToken";
const AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

let renovacaoEmAndamento: Promise<string> | null = null;

function limparSessao() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem("@gSimulados:user");
  delete api.defaults.headers.common.Authorization;
}

/**
 * Uma renovação por vez: se três chamadas tomarem 401 juntas, todas esperam o
 * mesmo refresh em vez de rotacionar o token três vezes (a rotação revoga o
 * anterior, então corrida aqui derrubaria a sessão).
 */
function renovarToken(): Promise<string> {
  if (!renovacaoEmAndamento) {
    renovacaoEmAndamento = (async () => {
      const refreshToken = localStorage.getItem(REFRESH_KEY);
      if (!refreshToken) throw new Error("Sessão expirada");

      const { data } = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        { refreshToken },
      );

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(REFRESH_KEY, data.refreshToken);
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      return data.token as string;
    })().finally(() => {
      renovacaoEmAndamento = null;
    });
  }
  return renovacaoEmAndamento;
}

/**
 * 402 = recurso pago sem assinatura. Não é erro genérico: abre o dialog com o
 * motivo e o caminho para /planos. Marca o erro como tratado para o
 * `useErrorHandler` não jogar um toast solto por cima.
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 402) {
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
      return Promise.reject(error);
    }

    const original = error.config as
      | (InternalAxiosRequestConfig & { __retry?: boolean })
      | undefined;
    const url = original?.url ?? "";

    if (
      error.response?.status === 401 &&
      original &&
      !original.__retry &&
      !AUTH_PATHS.some((path) => url.includes(path))
    ) {
      original.__retry = true;
      try {
        const token = await renovarToken();
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization =
          `Bearer ${token}`;
        return api(original);
      } catch {
        limparSessao();
        if (!window.location.pathname.startsWith("/login")) {
          window.location.assign("/login?expirado=1");
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
