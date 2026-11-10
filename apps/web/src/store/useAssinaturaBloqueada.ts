import { create } from "zustand";

interface AssinaturaBloqueadaState {
  open: boolean;
  mensagem: string;
  abrir: (mensagem: string) => void;
  fechar: () => void;
}

/**
 * Estado global do bloqueio 402. Fica fora do componente da página porque o
 * 402 vale para qualquer recurso pago (gerar simulado, extrair PDF etc.) e a
 * resposta precisa abrir o mesmo caminho para /planos em qualquer tela.
 */
export const useAssinaturaBloqueada = create<AssinaturaBloqueadaState>(
  (set) => ({
    open: false,
    mensagem: "",
    abrir: (mensagem) => set({ open: true, mensagem }),
    fechar: () => set({ open: false }),
  }),
);
