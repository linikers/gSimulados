import { Pagamento } from "../../models/Pagamento";
import { EventoWebhook } from "../../models/EventoWebhook";
import { PagBankService } from "./pagbank-client.service";
import { AssinaturaService } from "../assinatura.service";

export type ResultadoWebhook =
  | { resultado: "pago"; referencia: string; assinaturaAte: Date }
  | { resultado: "duplicado"; statusBruto?: string }
  | { resultado: "nao_encontrado"; referencia: string }
  | {
      resultado: "valor_divergente";
      esperadoCentavos: number;
      recebidoCentavos: number;
    }
  | { resultado: "recusado" | "cancelado" | "expirado"; referencia: string }
  | { resultado: "ignorado"; statusBruto?: string };

/**
 * Processa a notificação (webhook) do PagBank.
 *
 * Regras que evitam dinheiro errado liberando acesso:
 * - **idempotência**: a mesma notificação (mesma cobrança + status) só é
 *   processada uma vez — o PagBank reenvia quando acha que falhou;
 * - **valor conferido**: se o valor pago não for o esperado, o acesso NÃO é
 *   liberado (fica registrado para conferência);
 * - **status desconhecido** não libera nada;
 * - pagamento não encontrado não é erro fatal: registra e segue.
 */
export class PagBankWebhookService {
  static async processar(payload: unknown): Promise<ResultadoWebhook> {
    const notificacao = PagBankService.extrairNotificacao(payload);

    // 1) idempotência: o índice único do `chave` barra o reenvio.
    const chave = `${notificacao.chargeId ?? notificacao.pedidoId}:${notificacao.statusBruto ?? "SEM_STATUS"}`;
    try {
      await EventoWebhook.create({ chave, origem: "pagbank", payload });
    } catch (erro: any) {
      if (erro?.code === 11000) {
        return { resultado: "duplicado", statusBruto: notificacao.statusBruto };
      }
      throw erro;
    }

    // 2) nosso pagamento (procura por referência, cobrança ou pedido).
    const pagamento = await Pagamento.findOne({
      $or: [
        { referencia: notificacao.referencia },
        ...(notificacao.chargeId ? [{ pagbankChargeId: notificacao.chargeId }] : []),
        ...(notificacao.pedidoId ? [{ pagbankPedidoId: notificacao.pedidoId }] : []),
      ],
    });

    if (!pagamento) {
      return { resultado: "nao_encontrado", referencia: notificacao.referencia };
    }

    // 3) pago: confere valor, marca e renova a assinatura.
    if (notificacao.status === "pago") {
      const esperadoCentavos = Math.round(Number(pagamento.valor) * 100);
      if (
        notificacao.valorCentavos > 0 &&
        notificacao.valorCentavos !== esperadoCentavos
      ) {
        return {
          resultado: "valor_divergente",
          esperadoCentavos,
          recebidoCentavos: notificacao.valorCentavos,
        };
      }

      const agora = new Date();
      pagamento.status = "pago";
      pagamento.pagoEm = agora;
      if (notificacao.chargeId) pagamento.pagbankChargeId = notificacao.chargeId;
      if (notificacao.pedidoId) pagamento.pagbankPedidoId = notificacao.pedidoId;
      await pagamento.save();

      const assinatura = await AssinaturaService.renovar({
        usuarioId: String(pagamento.usuario),
        plano: pagamento.plano,
        agora,
      });

      return {
        resultado: "pago",
        referencia: notificacao.referencia,
        assinaturaAte: assinatura.cicloFim as Date,
      };
    }

    // 4) recusa/cancelamento/expiração.
    if (
      notificacao.status === "recusado" ||
      notificacao.status === "cancelado" ||
      notificacao.status === "expirado"
    ) {
      if (pagamento.status === "pendente") {
        pagamento.status = notificacao.status;
        if (notificacao.chargeId) pagamento.pagbankChargeId = notificacao.chargeId;
        await pagamento.save();
      }
      return { resultado: notificacao.status, referencia: notificacao.referencia };
    }

    // 5) status que não conhecemos: não libera e não muda nada.
    return { resultado: "ignorado", statusBruto: notificacao.statusBruto };
  }
}
