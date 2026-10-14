import axios, { AxiosError, AxiosInstance } from "axios";

/**
 * Cliente da API de Pedidos do PagBank (Orders).
 *
 * Contrato levantado na documentação oficial (out/2026):
 * - `POST /orders` cria um pedido e já cobra (PIX, boleto, cartão, Pagar com PagBank);
 * - valores em **centavos** (`1990` = R$ 19,90);
 * - `customer.tax_id` (CPF/CNPJ) é **obrigatório**;
 * - webhook: campo `notification_urls` no payload da cobrança — o PagBank faz POST
 *   na nossa URL a cada mudança de status, com o mesmo formato do response síncrono;
 * - certificado mTLS **não** é exigido pela Orders (só Transferência/Pix Bacen).
 *
 * A conta é PF, e a API de Assinaturas do PagBank é restrita a PJ — por isso a
 * recorrência é feita por nós, criando um pedido por ciclo.
 */

export const PAGBANK_SANDBOX = "https://sandbox.api.pagseguro.com";
export const PAGBANK_PRODUCAO = "https://api.pagseguro.com";

export type MetodoPagBank = "PIX" | "BOLETO" | "CREDIT_CARD";

/** Status que o PagBank devolve em `charges[].status`. */
export type StatusPagBank =
  | "WAITING"
  | "IN_ANALYSIS"
  | "PAID"
  | "AVAILABLE"
  | "DECLINED"
  | "CANCELED"
  | "EXPIRED"
  | "REFUNDED"
  | string;

/** Status que usamos internamente (bate com `Pagamento.status`). */
export type StatusInterno =
  | "pendente"
  | "pago"
  | "recusado"
  | "cancelado"
  | "expirado";

const MAPA_STATUS: Record<string, StatusInterno> = {
  WAITING: "pendente",
  IN_ANALYSIS: "pendente",
  PAID: "pago",
  AVAILABLE: "pago",
  DECLINED: "recusado",
  CANCELED: "cancelado",
  EXPIRED: "expirado",
  REFUNDED: "cancelado",
};

/** Status desconhecido cai em `pendente` — nunca liberar acesso por engano. */
export function statusInterno(status: StatusPagBank): StatusInterno {
  return MAPA_STATUS[String(status ?? "").toUpperCase()] ?? "pendente";
}

export interface ClientePagBank {
  nome: string;
  email: string;
  /** CPF (11) ou CNPJ (14), só dígitos. Obrigatório pela API. */
  taxId: string;
}

export interface ItemPedido {
  nome: string;
  quantidade: number;
  valorCentavos: number;
  referencia?: string;
}

export interface CartaoCredito {
  numero: string;
  titular: string;
  /** CPF do titular — o PagBank exige (campo `holder.tax_id`). */
  titularTaxId: string;
  mes: string;
  ano: string;
  cvv: string;
  parcelas?: number;
}

export interface CriarPedidoParams {
  /** Nosso identificador (ex.: a referência do pagamento). */
  referencia: string;
  cliente: ClientePagBank;
  itens: ItemPedido[];
  metodo: MetodoPagBank;
  descricao?: string;
  /** Validade do PIX em minutos (default 3 dias, igual ao PIX manual de hoje). */
  expiracaoPixMinutos?: number;
  /** URLs que recebem o POST de mudança de status. */
  notificationUrls?: string[];
  cartao?: CartaoCredito;
  /** Nome que aparece na fatura do cliente (default: env ou GSIMULADOS). */
  softDescriptor?: string;
}

export interface PedidoNormalizado {
  pedidoId: string;
  chargeId?: string;
  status: StatusInterno;
  statusBruto?: string;
  valorCentavos: number;
  referencia: string;
  /** PIX copia-e-cola. */
  qrCodeTexto?: string;
  qrCodePngUrl?: string;
  /** Boleto: linha digitável + PDF, quando houver. */
  boletoBarcode?: string;
  boletoPdfUrl?: string;
  bruto: unknown;
}

export class PagBankErro extends Error {
  readonly status?: number;
  readonly detalhes?: unknown;
  constructor(mensagem: string, status?: number, detalhes?: unknown) {
    super(mensagem);
    this.name = "PagBankErro";
    this.status = status;
    this.detalhes = detalhes;
  }
}

const TENTATIVAS = Number(process.env.PAGBANK_TENTATIVAS || 2);

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class PagBankService {
  /** Token do ambiente atual (sandbox ou produção) — nunca logado. */
  private static token(): string {
    const token = process.env.PAGBANK_TOKEN?.trim();
    if (!token) {
      throw new PagBankErro(
        "PAGBANK_TOKEN não configurado: defina o token do Portal do Desenvolvedor (sandbox) ou de Vendas → Integrações (produção).",
      );
    }
    return token;
  }

  static baseUrl(): string {
    return (
      process.env.PAGBANK_BASE_URL?.trim().replace(/\/+$/, "") || PAGBANK_SANDBOX
    );
  }

  static producao(): boolean {
    return this.baseUrl() === PAGBANK_PRODUCAO;
  }

  private static cliente(): AxiosInstance {
    return axios.create({
      baseURL: this.baseUrl(),
      timeout: Number(process.env.PAGBANK_TIMEOUT_MS || 20000),
      headers: {
        Authorization: `Bearer ${this.token()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }

  /** Soma dos itens em centavos. */
  static valorTotal(itens: ItemPedido[]): number {
    return itens.reduce(
      (total, item) => total + item.valorCentavos * item.quantidade,
      0,
    );
  }

  /**
   * Faz a requisição repetindo em falha transitória (5xx/rede). 4xx não repete:
   * é erro do payload/token e repetir só gasta tempo.
   */
  private static async requisitar<T>(
    metodo: "get" | "post",
    caminho: string,
    corpo?: unknown,
  ): Promise<T> {
    const cli = this.cliente();
    let ultimoErro: unknown;

    for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa++) {
      try {
        const resposta =
          metodo === "post"
            ? await cli.post<T>(caminho, corpo)
            : await cli.get<T>(caminho);
        return resposta.data;
      } catch (error) {
        const erro = error as AxiosError;
        const status = erro.response?.status;
        const dados = erro.response?.data;
        ultimoErro = error;

        if (status === 401 || status === 403) {
          throw new PagBankErro(
            "PagBank recusou o token (401/403). Confira o token do ambiente certo: sandbox no Portal do Desenvolvedor, produção em Vendas → Integrações.",
            status,
            dados,
          );
        }
        if (status && status < 500) {
          // Erro conhecido e que não é do código: a conta recebedora precisa de
          // pelo menos uma chave PIX de endereçamento ativa (doc do QR Code PIX).
          const descricoes = JSON.stringify(dados ?? "");
          if (/Pix key was not found/i.test(descricoes)) {
            throw new PagBankErro(
              "A conta PagBank recebedora não tem chave PIX ativa. Cadastre uma chave PIX na conta (app/site do PagBank) antes de cobrar por PIX.",
              status,
              dados,
            );
          }
          throw new PagBankErro(
            `PagBank recusou a requisição (${status}).`,
            status,
            dados,
          );
        }
        if (tentativa < TENTATIVAS) await esperar(1000 * tentativa);
      }
    }

    const status = (ultimoErro as AxiosError)?.response?.status;
    throw new PagBankErro(
      `Falha ao falar com o PagBank${status ? ` (${status})` : ""}.`,
      status,
      (ultimoErro as AxiosError)?.response?.data,
    );
  }

  /** Cria o pedido (e a cobrança) no PagBank. */
  static async criarPedido(
    params: CriarPedidoParams,
  ): Promise<PedidoNormalizado> {
    if (!params.itens?.length) {
      throw new PagBankErro("O pedido precisa de pelo menos um item.");
    }
    if (!/^\d{11}$|^\d{14}$/.test(String(params.cliente?.taxId ?? ""))) {
      throw new PagBankErro(
        "CPF (11 dígitos) ou CNPJ (14 dígitos) do cliente é obrigatório no PagBank.",
      );
    }
    if (params.metodo === "CREDIT_CARD" && !params.cartao) {
      throw new PagBankErro("Pagamento no cartão exige os dados do cartão.");
    }

    const metodoPagamento: Record<string, unknown> = {
      type: params.metodo,
    };

    const softDescriptor =
      (params.softDescriptor ?? process.env.PAGBANK_SOFT_DESCRIPTOR ?? "GSIMULADOS")
        .replace(/[^\w\s.-]/g, "")
        .slice(0, 22)
        .trim() || "GSIMULADOS";

    if (params.metodo === "PIX") {
      const minutos = params.expiracaoPixMinutos ?? 3 * 24 * 60;
      metodoPagamento.pix = {
        expiration_date: new Date(Date.now() + minutos * 60_000).toISOString(),
      };
    }

    if (params.metodo === "CREDIT_CARD" && params.cartao) {
      // Forma VERIFICADA ao vivo no sandbox (201 + PAID / DECLINED):
      // `card` e `holder` ficam dentro de payment_method, junto de
      // installments/capture, e o soft_descriptor também é do payment_method
      // (não existe em `seller` — mandar em `seller` devolve
      // "charges[0].seller.soft_descriptor: must not be empty").
      if (!/^\d{11}$/.test(String(params.cartao.titularTaxId ?? ""))) {
        throw new PagBankErro("O CPF do titular do cartão é obrigatório (11 dígitos).");
      }
      metodoPagamento.installments = params.cartao.parcelas ?? 1;
      metodoPagamento.capture = true;
      metodoPagamento.soft_descriptor = softDescriptor;
      metodoPagamento.card = {
        number: params.cartao.numero,
        exp_month: params.cartao.mes,
        exp_year: params.cartao.ano,
        security_code: params.cartao.cvv,
        holder: {
          name: params.cartao.titular,
          tax_id: String(params.cartao.titularTaxId).replace(/\D/g, ""),
        },
      };
    }

    const corpo = {
      reference_id: params.referencia,
      customer: {
        name: params.cliente.nome,
        email: params.cliente.email,
        tax_id: String(params.cliente.taxId).replace(/\D/g, ""),
      },
      items: params.itens.map((item) => ({
        name: item.nome,
        quantity: item.quantidade,
        unit_amount: item.valorCentavos,
        ...(item.referencia ? { reference_id: item.referencia } : {}),
      })),
      charges: [
        {
          reference_id: params.referencia,
          ...(params.descricao ? { description: params.descricao } : {}),
          amount: {
            value: this.valorTotal(params.itens),
            currency: "BRL",
          },
          payment_method: metodoPagamento,
          ...(params.notificationUrls?.length
            ? { notification_urls: params.notificationUrls }
            : {}),
        },
      ],
    };

    const resposta = await this.requisitar<any>("post", "/orders", corpo);
    return this.normalizar(resposta, params.referencia);
  }

  static async consultarPedido(pedidoId: string): Promise<PedidoNormalizado> {
    const resposta = await this.requisitar<any>(
      "get",
      `/orders/${encodeURIComponent(pedidoId)}`,
    );
    return this.normalizar(resposta, resposta?.reference_id ?? "");
  }

  static async cancelarCobranca(chargeId: string): Promise<StatusInterno> {
    const resposta = await this.requisitar<any>(
      "post",
      `/charges/${encodeURIComponent(chargeId)}/cancel`,
    );
    return statusInterno(resposta?.status);
  }

  /**
   * Lê a notificação (webhook) do PagBank. O payload da notificação tem o
   * mesmo formato do response síncrono da API — então basta normalizar.
   */
  static extrairNotificacao(payload: unknown): PedidoNormalizado {
    return this.normalizar(payload, (payload as any)?.reference_id ?? "");
  }

  /** Achata a resposta do PagBank no que o nosso código usa. */
  static normalizar(resposta: any, referencia: string): PedidoNormalizado {
    const cobranca = resposta?.charges?.[0] ?? {};
    const qr = resposta?.qr_code?.[0] ?? cobranca?.payment_method?.pix ?? {};
    const boleto = cobranca?.payment_method?.boleto ?? {};
    const link = (rel: string) =>
      (qr?.links ?? cobranca?.links ?? []).find((l: any) => l?.rel === rel)
        ?.href;

    return {
      pedidoId: resposta?.id ?? "",
      chargeId: cobranca?.id,
      status: statusInterno(cobranca?.status),
      statusBruto: cobranca?.status,
      valorCentavos: cobranca?.amount?.value ?? resposta?.amount?.value ?? 0,
      referencia: resposta?.reference_id ?? referencia,
      qrCodeTexto: qr?.text,
      qrCodePngUrl: link("QRCODE.PNG") ?? link("QRCODE.BASE64"),
      boletoBarcode: boleto?.barcode ?? boleto?.formatted_barcode,
      boletoPdfUrl: link("BOLETO.PDF"),
      bruto: resposta,
    };
  }
}
