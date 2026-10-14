import { Request, Response, NextFunction } from "express";
import { AssinaturaService } from "../services/assinatura.service";

/**
 * Bloqueia as ações que consomem o produto quando a assinatura não está ativa.
 *
 * Regra: **nada de plano gratuito**. Quem libera é:
 * - assinatura própria com ciclo vigente, ou
 * - escola com ciclo ativo (o aluno vinculado não é cobrado).
 *
 * Responde 402 (Payment Required) com o motivo e o caminho do checkout — o
 * front usa isso para mostrar a tela de assinatura em vez de um erro seco.
 * Admin passa direto (é quem opera o sistema).
 */
export async function requireAssinaturaAtiva(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (req.userRole === "admin") return next();

    const { liberado, motivo } = await AssinaturaService.acessoLiberado(
      req.userId,
    );
    if (liberado) return next();

    return res.status(402).json({
      error: "Assinatura necessária",
      motivo,
      mensagem:
        "Sua assinatura não está ativa. Assine para continuar gerando simulados.",
      checkout: "/pagamentos/checkout",
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
