import { useToast } from "../store/useToast";
import { useCallback } from "react";
import axios from "axios";

export function useErrorHandler() {
  const { showToast } = useToast();

  const handleError = useCallback(
    (error: unknown, customMessage?: string) => {
      // 402 já foi tratado no interceptor (dialog de assinatura): não duplica toast.
      if ((error as { __assinaturaTratada?: boolean })?.__assinaturaTratada) {
        return;
      }

      console.error("[ErrorHandler]:", error);

      let message = customMessage || "Ocorreu um erro inesperado.";

      if (axios.isAxiosError(error)) {
        // Erro da API (Axios)
        message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          customMessage ||
          error.message;
      } else if (error instanceof Error) {
        // Erro padrão do JS
        message = customMessage || error.message;
      }

      showToast(message, "error");
    },
    [showToast],
  );

  return { handleError };
}
