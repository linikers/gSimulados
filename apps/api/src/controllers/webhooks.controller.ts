import { Request, Response } from "express";
import { PagBankWebhookService } from "../services/pagbank/webhook.service";

/**
 * Webhook do PagBank. O PagBank faz `POST` aqui a cada mudança de status da
 * cobrança (configurado em `notification_urls` no pedido).
 *
 * Responder 200 rápido: se devolvermos erro, o PagBank reenvia a notificação
 * (o que é seguro, porque o processamento é idempotente, mas gera ruído).
 * Erro inesperado devolve 500 de propósito — queremos o reenvio.
 */
export class WebhooksController {
  static async pagbank(req: Request, res: Response) {
    try {
      const resultado = await PagBankWebhookService.processar(req.body ?? {});
      const http = resultado.resultado === "valor_divergente" ? 422 : 200;
      res.status(http).json({ ok: http === 200, ...resultado });
    } catch (error: any) {
      console.error("[WebhookPagBank] falha ao processar:", error?.message);
      res.status(500).json({ ok: false, error: "falha ao processar notificação" });
    }
  }
}
