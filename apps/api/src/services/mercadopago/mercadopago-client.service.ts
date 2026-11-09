/**
 * Cliente do Mercado Pago — Checkout Transparente via Orders API.
 *
 * Contrato verificado ao vivo no projeto ecr20ttk (out/2026):
 * - `POST /v1/orders` com `type: "online"`, `processing_mode: "automatic"` e a
 *   cobrança em `transactions.payments[]` (a Orders API aceita UMA transação);
 * - `total_amount` (string) tem que bater com a soma dos pagamentos;
 * - header `X-Idempotency-Key` é obrigatório (1..64 chars);
 * - PIX: `payment_method: { id: "pix", type: "bank_transfer" }`; o QR volta em
 *   `transactions.payments[].payment_method.qr_code` (+ `qr_code_base64`);
 * - credencial de teste NÃO funciona nesta API (`401 invalid_credentials`):
 *   use credencial de produção (a do projeto ecr20ttk serve);
 * - webhook chega como `{ type: "order", data: { id } }` e a verdade se lê em
 *   `GET /v1/orders/{id}`; notificação de pagamento manda o id de pagamento.
 *
 * Regra que vale para os dois provedores: status desconhecido NUNCA libera.
 */

export const MP_BASE = "https://api.mercadopago.com";

export type StatusInterno =
  | "pendente"
  | "pago"
  | "recusado"
  | "cancelado"
  | "expirado";

const MAPA_ORDEM: Record<string, StatusInterno> = {
  processed: "pago",
  created: "pendente",
  action_required: "pendente",
  canceled: "cancelado",
  cancelled: "cancelado",
  expired: "expirado",
  failed: "recusado",
};

const MAPA_PAGAMENTO: Record<string, StatusInterno> = {
  approved: "pago",
  processed: "pago",
  pending: "pendente",
  in_process: "pendente",
  authorized: "pendente",
  action_required: "pendente",
  rejected: "recusado",
  failed: "recusado",
  cancelled: "cancelado",
  canceled: "cancelado",
  refunded: "cancelado",
  charged_back: "cancelado",
};

export interface PagamentoMP {
  id?: string;
  status?: string;
  status_detail?: string;
  payment_method?: {
    id?: string;
    type?: string;
    qr_code?: string;
    qr_code_base64?: string;
    ticket_url?: string;
  };
}

export interface OrdemMP {
  id?: string;
  reference_id?: string;
  external_reference?: string;
  total_amount?: string;
  status?: string;
  status_detail?: string;
  transactions?: { payments?: PagamentoMP[] };
}

export function statusInternoMP(ordem?: OrdemMP | null): StatusInterno {
  const pagamento = ordem?.transactions?.payments?.[0];
  const doPagamento =
    MAPA_PAGAMENTO[String(pagamento?.status ?? "").toLowerCase()];
  if (doPagamento) return doPagamento;

  const daOrdem = MAPA_ORDEM[String(ordem?.status ?? "").toLowerCase()];
  if (daOrdem) return daOrdem;

  return "pendente";
}

export interface CobrancaMP {
  pedidoId: string;
  pagamentoId?: string;
  status: StatusInterno;
  statusBruto?: string;
  statusDetalhe?: string;
  valorCentavos: number;
  referencia: string;
  qrCodeTexto?: string;
  qrCodeImagem?: string;
  linkPagamento?: string;
  bruto: unknown;
}

export class MercadoPagoErro extends Error {
  readonly http?: number;
  readonly detalhes?: unknown;
  constructor(mensagem: string, http?: number, detalhes?: unknown) {
    super(mensagem);
    this.name = "MercadoPagoErro";
    this.http = http;
    this.detalhes = detalhes;
  }
}

export const MercadoPagoService = {
  configurado(): boolean {
    return Boolean(process.env.MP_ACCESS_TOKEN?.trim());
  },

  baseUrl(): string {
    return (
      process.env.MP_BASE_URL?.trim().replace(/\/+$/, "") || MP_BASE
    );
  },

  /**
   * Referência do MP só aceita letras, números e hífen (verificado ao vivo:
   * e-mail com `@` devolve 400 property_value). Nunca pode sair vazia.
   */
  referenciaValida(referencia: string): string {
    const limpa = String(referencia ?? "")
      .replace(/[^A-Za-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 64);
    return limpa || `GS-${Date.now()}`;
  },

  async criarCobrancaPix(params: {
    referencia: string;
    valorCentavos: number;
    descricao: string;
    cliente: { nome: string; email: string; taxId?: string };
    expiracao?: string;
  }): Promise<CobrancaMP> {
    const valor = (params.valorCentavos / 100).toFixed(2);
    const [primeiroNome, ...resto] = String(params.cliente?.nome ?? "")
      .trim()
      .split(/\s+/);
    const documento = String(params.cliente?.taxId ?? "").replace(/\D/g, "");
    const referencia = this.referenciaValida(params.referencia);

    const corpo = {
      type: "online",
      processing_mode: "automatic",
      total_amount: valor,
      external_reference: referencia,
      transactions: {
        payments: [
          {
            amount: valor,
            payment_method: { id: "pix", type: "bank_transfer" },
            expiration_time: params.expiracao ?? "PT1H",
          },
        ],
      },
      payer: {
        email: params.cliente.email,
        ...(primeiroNome ? { first_name: primeiroNome } : {}),
        ...(resto.length ? { last_name: resto.join(" ") } : {}),
        ...(documento.length === 11 || documento.length === 14
          ? {
              identification: {
                type: documento.length === 11 ? "CPF" : "CNPJ",
                number: documento,
              },
            }
          : {}),
      },
    };

    const resposta = await this.requisitar<OrdemMP>(
      "POST",
      "/v1/orders",
      corpo,
      referencia,
    );
    return this.normalizar(resposta, referencia);
  },

  async consultarPedido(pedidoId: string): Promise<CobrancaMP> {
    const resposta = await this.requisitar<OrdemMP>(
      "GET",
      `/v1/orders/${encodeURIComponent(pedidoId)}`,
    );
    return this.normalizar(resposta, resposta?.external_reference ?? "");
  },

  async consultarPagamento(pagamentoId: string): Promise<{
    status: StatusInterno;
    statusBruto?: string;
    statusDetalhe?: string;
    valorCentavos: number;
    referencia: string;
    ordemId?: string;
  }> {
    const dados = await this.requisitar<{
      id?: string | number;
      status?: string;
      status_detail?: string;
      transaction_amount?: number;
      external_reference?: string;
      order?: { id?: string };
      order_id?: string;
    }>("GET", `/v1/payments/${encodeURIComponent(pagamentoId)}`);

    return {
      status: statusInternoMP({
        status: dados?.status,
        transactions: { payments: [{ status: dados?.status }] },
      }),
      statusBruto: dados?.status,
      statusDetalhe: dados?.status_detail,
      valorCentavos: Math.round(Number(dados?.transaction_amount ?? 0) * 100),
      referencia: dados?.external_reference ?? "",
      ordemId: dados?.order?.id ?? dados?.order_id,
    };
  },

  normalizar(resposta: OrdemMP | null, referencia = ""): CobrancaMP {
    const pagamento = resposta?.transactions?.payments?.[0];
    const metodo = pagamento?.payment_method ?? {};
    const base64 = metodo.qr_code_base64;

    return {
      pedidoId: resposta?.id ?? "",
      pagamentoId: pagamento?.id,
      status: statusInternoMP(resposta),
      statusBruto: pagamento?.status ?? resposta?.status,
      statusDetalhe: pagamento?.status_detail ?? resposta?.status_detail,
      valorCentavos: Math.round(Number(resposta?.total_amount ?? 0) * 100),
      referencia: resposta?.external_reference ?? referencia,
      qrCodeTexto: metodo.qr_code,
      qrCodeImagem: base64 ? `data:image/png;base64,${base64}` : undefined,
      linkPagamento: metodo.ticket_url,
      bruto: resposta,
    };
  },

  /** 5xx/rede repete; 4xx não (é payload/token/credencial). */
  async requisitar<T>(
    metodo: "GET" | "POST",
    caminho: string,
    corpo?: unknown,
    idempotencia?: string,
  ): Promise<T> {
    const token = process.env.MP_ACCESS_TOKEN?.trim();
    if (!token) {
      throw new MercadoPagoErro(
        "MP_ACCESS_TOKEN não configurado (Mercado Pago → Suas integrações → Credenciais).",
      );
    }

    const tentativas = Number(process.env.MP_TENTATIVAS || 2);
    let ultimoHttp: number | undefined;
    let ultimoCorpo: unknown;

    for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
      const resposta = await fetch(`${this.baseUrl()}${caminho}`, {
        method: metodo,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(idempotencia ? { "X-Idempotency-Key": idempotencia } : {}),
        },
        body: corpo ? JSON.stringify(corpo) : undefined,
        cache: "no-store",
      });

      const dados = (await resposta.json().catch(() => null)) as
        | (Record<string, unknown> & T)
        | null;

      if (resposta.ok) return dados as T;

      ultimoHttp = resposta.status;
      ultimoCorpo = dados;

      const detalhe = this.motivoErro(dados);

      if (resposta.status === 401 || resposta.status === 403) {
        if (/invalid_credentials/i.test(JSON.stringify(dados ?? ""))) {
          throw new MercadoPagoErro(
            "Mercado Pago recusou as credenciais: esta API não aceita credencial de teste. Use a credencial de produção.",
            resposta.status,
            dados,
          );
        }
        throw new MercadoPagoErro(
          `Mercado Pago recusou as credenciais (${resposta.status})${detalhe ? `: ${detalhe}` : "."}`,
          resposta.status,
          dados,
        );
      }

      if (resposta.status < 500) {
        throw new MercadoPagoErro(
          `Mercado Pago recusou a requisição (${resposta.status})${detalhe ? `: ${detalhe}` : "."}`,
          resposta.status,
          dados,
        );
      }

      if (tentativa < tentativas) {
        await new Promise((res) => setTimeout(res, 1000 * tentativa));
      }
    }

    throw new MercadoPagoErro(
      `Falha ao falar com o Mercado Pago${ultimoHttp ? ` (${ultimoHttp})` : ""}.`,
      ultimoHttp,
      ultimoCorpo,
    );
  },

  motivoErro(dados: any): string {
    if (!dados) return "";
    const causa = dados?.cause?.[0];
    const erro = dados?.errors?.[0];
    const campo =
      erro?.details?.property ??
      erro?.details?.message ??
      causa?.details?.property ??
      causa?.details?.message ??
      "";

    const partes = [
      erro?.code ?? causa?.code,
      campo ? `campo: ${campo}` : "",
      erro?.message ?? causa?.description,
      dados?.message ?? dados?.error,
    ].filter(Boolean);

    return Array.from(new Set(partes)).join(" — ");
  },

  /**
   * Extrai tipo e id de uma notificação do MP. O corpo é só um aviso
   * (`{ type, data: { id } }`), mas o painel também manda por query string.
   */
  extrairNotificacao(payload: unknown, query?: Record<string, any>): {
    tipo: string;
    id: string;
    acao?: string;
  } {
    const body = (payload ?? {}) as {
      type?: string;
      action?: string;
      data?: { id?: string | number };
    };
    return {
      tipo: String(body.type ?? query?.type ?? ""),
      id: String(body.data?.id ?? query?.["data.id"] ?? ""),
      acao: body.action,
    };
  },
};
