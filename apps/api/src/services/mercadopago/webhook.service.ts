import { Pagamento } from "../../models/Pagamento";
import { EventoWebhook } from "../../models/EventoWebhook";
import { AssinaturaService } from "../assinatura.service";
import {
  CobrancaMP,
  MercadoPagoErro,
  MercadoPagoService,
} from "./mercadopago-client.service";

export type ResultadoWebhookMP =
  | { resultado: "pago"; referencia: string; assinaturaAte: Date }
  | { resultado: "duplicado"; statusBruto?: string }
  | { resultado: "nao_encontrado"; referencia: string }
  | {
      resultado: "valor_divergente";
      esperadoCentavos: number;
      recebidoCentavos: number;
    }
  | { resultado: "recusado" | "cancelado" | "expirado"; referencia: string }
  | { resultado: "ignorado"; motivo: string };

/**
 * Processa a notificação do Mercado Pago.
 *
 * O corpo do webhook é só um aviso; o status de verdade é lido na API:
 * 1. `type: "order"` → `GET /v1/orders/{id}`;
 * 2. notificação de pagamento manda o id do pagamento → `GET /v1/payments/{id}`
 *    e, se ele apontar a ordem, confirma pela ordem (recurso canônico).
 *
 * Travas iguais às do PagBank: idempotência por evento, valor conferido e
 * status desconhecido não libera acesso.
 */
export class MercadoPagoWebhookService {
  static async processar(
    payload: unknown,
    query?: Record<string, any>,
  ): Promise<ResultadoWebhookMP> {
    const notificacao = MercadoPagoService.extrairNotificacao(payload, query);
    if (!notificacao.id) {
      return { resultado: "ignorado", motivo: "notificacao_sem_id" };
    }

    const cobranca = await this.resolverCobranca(
      notificacao.tipo,
      notificacao.id,
    );

    const chave = `${cobranca.pedidoId || notificacao.id}:${cobranca.statusBruto ?? "SEM_STATUS"}`;
    try {
      await EventoWebhook.create({
        chave,
        origem: "mercadopago",
        payload: { notificacao, cobranca: cobranca.bruto },
      });
    } catch (erro: any) {
      if (erro?.code === 11000) {
        return { resultado: "duplicado", statusBruto: cobranca.statusBruto };
      }
      throw erro;
    }

    const pagamento = await Pagamento.findOne({
      $or: [
        { referencia: cobranca.referencia },
        ...(cobranca.pedidoId
          ? [{ mercadopagoPedidoId: cobranca.pedidoId }]
          : []),
        ...(cobranca.pagamentoId
          ? [{ mercadopagoPaymentId: cobranca.pagamentoId }]
          : []),
      ],
    });

    if (!pagamento) {
      return {
        resultado: "nao_encontrado",
        referencia: cobranca.referencia,
      };
    }

    if (cobranca.status === "pago") {
      const esperadoCentavos = Math.round(Number(pagamento.valor) * 100);
      if (
        cobranca.valorCentavos > 0 &&
        cobranca.valorCentavos !== esperadoCentavos
      ) {
        return {
          resultado: "valor_divergente",
          esperadoCentavos,
          recebidoCentavos: cobranca.valorCentavos,
        };
      }

      const agora = new Date();
      pagamento.status = "pago";
      pagamento.pagoEm = agora;
      if (cobranca.pedidoId) pagamento.mercadopagoPedidoId = cobranca.pedidoId;
      if (cobranca.pagamentoId) {
        pagamento.mercadopagoPaymentId = cobranca.pagamentoId;
      }
      if (cobranca.statusDetalhe) {
        pagamento.statusDetalhe = cobranca.statusDetalhe;
      }
      await pagamento.save();

      const assinatura = await AssinaturaService.renovar({
        usuarioId: String(pagamento.usuario),
        plano: pagamento.plano,
        agora,
      });

      return {
        resultado: "pago",
        referencia: cobranca.referencia,
        assinaturaAte: assinatura.cicloFim as Date,
      };
    }

    if (
      cobranca.status === "recusado" ||
      cobranca.status === "cancelado" ||
      cobranca.status === "expirado"
    ) {
      if (pagamento.status === "pendente") {
        pagamento.status = cobranca.status;
        if (cobranca.pedidoId) {
          pagamento.mercadopagoPedidoId = cobranca.pedidoId;
        }
        if (cobranca.statusDetalhe) {
          pagamento.statusDetalhe = cobranca.statusDetalhe;
        }
        await pagamento.save();
      }
      return {
        resultado: cobranca.status,
        referencia: cobranca.referencia,
      };
    }

    return {
      resultado: "ignorado",
      motivo: `status_${cobranca.statusBruto ?? "desconhecido"}`,
    };
  }

  private static async resolverCobranca(
    tipo: string,
    id: string,
  ): Promise<CobrancaMP> {
    if (tipo === "order" || tipo === "") {
      try {
        return await MercadoPagoService.consultarPedido(id);
      } catch (erro) {
        const e = erro as MercadoPagoErro;
        if (e.http !== 404) throw erro;
      }
    }

    const pagamento = await MercadoPagoService.consultarPagamento(id);
    if (pagamento.ordemId) {
      return await MercadoPagoService.consultarPedido(pagamento.ordemId);
    }

    return {
      pedidoId: "",
      pagamentoId: id,
      status: pagamento.status,
      statusBruto: pagamento.statusBruto,
      statusDetalhe: pagamento.statusDetalhe,
      valorCentavos: pagamento.valorCentavos,
      referencia: pagamento.referencia,
      bruto: pagamento,
    };
  }
}
