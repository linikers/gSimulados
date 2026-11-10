/**
 * Cliente Mercado Pago — contrato e defesas.
 *
 * Nada aqui fala com a internet: `fetch` é mockado. Os casos fixam o que a
 * Orders API exige (valor em string, transação única, idempotência) e o que não
 * pode acontecer (status desconhecido liberando acesso, retry em 401).
 */

import {
  MercadoPagoErro,
  MercadoPagoService,
  descreverRejeicaoMP,
  statusInternoMP,
} from "../../services/mercadopago/mercadopago-client.service";

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  (global as any).fetch = fetchMock;
  process.env.MP_ACCESS_TOKEN = "APP_USR-teste";
  delete process.env.MP_BASE_URL;
});

afterEach(() => {
  delete process.env.MP_ACCESS_TOKEN;
  delete process.env.MP_BASE_URL;
});

function resposta(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

const ordemPix = {
  id: "ORD-123",
  external_reference: "GS-ABC123",
  total_amount: "19.90",
  status: "action_required",
  transactions: {
    payments: [
      {
        id: "PAY-1",
        status: "action_required",
        payment_method: {
          id: "pix",
          type: "bank_transfer",
          qr_code: "00020126...",
          qr_code_base64: "aW1hZ2Vt",
          ticket_url: "https://mp/ticket",
        },
      },
    ],
  },
};

describe("MercadoPagoService", () => {
  it("sem token responde não configurado", () => {
    delete process.env.MP_ACCESS_TOKEN;
    expect(MercadoPagoService.configurado()).toBe(false);
  });

  it("cria cobrança PIX com valor em string, transação única e idempotência", async () => {
    fetchMock.mockResolvedValue(resposta(201, ordemPix));

    const cobranca = await MercadoPagoService.criarCobrancaPix({
      referencia: "GS-ABC123",
      valorCentavos: 1990,
      descricao: "Individual",
      cliente: { nome: "Aluno Teste", email: "aluno@teste.com", taxId: "123.456.789-09" },
    });

    expect(cobranca.pedidoId).toBe("ORD-123");
    expect(cobranca.qrCodeTexto).toBe("00020126...");
    expect(cobranca.qrCodeImagem).toMatch(/^data:image\/png;base64,/);
    expect(cobranca.status).toBe("pendente");

    const [url, init] = fetchMock.mock.calls[0];
    const corpo = JSON.parse(init.body);
    expect(url).toBe("https://api.mercadopago.com/v1/orders");
    expect(init.headers["X-Idempotency-Key"]).toBe("GS-ABC123");
    expect(corpo.total_amount).toBe("19.90");
    expect(corpo.transactions.payments).toHaveLength(1);
    expect(corpo.transactions.payments[0].amount).toBe("19.90");
    expect(corpo.transactions.payments[0].payment_method).toEqual({
      id: "pix",
      type: "bank_transfer",
    });
    expect(corpo.payer.identification).toEqual({
      type: "CPF",
      number: "12345678909",
    });
  });

  it("sanea a referência: MP só aceita letras, números e hífen", () => {
    expect(MercadoPagoService.referenciaValida("qa.aluno+gs@teste.com")).toBe(
      "qa-aluno-gs-teste-com",
    );
    expect(MercadoPagoService.referenciaValida("")).toMatch(/^GS-\d+$/);
  });

  it("status desconhecido não libera acesso", () => {
    expect(statusInternoMP({ status: "inventado" })).toBe("pendente");
    expect(
      statusInternoMP({ transactions: { payments: [{ status: "inventado" }] } }),
    ).toBe("pendente");
    expect(
      statusInternoMP({ transactions: { payments: [{ status: "approved" }] } }),
    ).toBe("pago");
  });

  it("401 de credencial inválida não repete e explica que teste não serve", async () => {
    fetchMock.mockResolvedValue(
      resposta(401, { error: "invalid_credentials", message: "invalid" }),
    );

    await expect(
      MercadoPagoService.criarCobrancaPix({
        referencia: "GS-X",
        valorCentavos: 1990,
        descricao: "Individual",
        cliente: { nome: "Aluno", email: "a@b.com" },
      }),
    ).rejects.toThrow(/não aceita credencial de teste/i);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("5xx repete e depois desiste", async () => {
    process.env.MP_TENTATIVAS = "2";
    fetchMock.mockResolvedValue(resposta(503, { message: "indisponível" }));

    await expect(
      MercadoPagoService.criarCobrancaPix({
        referencia: "GS-X",
        valorCentavos: 1990,
        descricao: "Individual",
        cliente: { nome: "Aluno", email: "a@b.com" },
      }),
    ).rejects.toBeInstanceOf(MercadoPagoErro);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    delete process.env.MP_TENTATIVAS;
  });

  it("extrai high_risk do details em lista de strings (402 da Orders API)", async () => {
    fetchMock.mockResolvedValue(
      resposta(402, {
        errors: [
          {
            code: "failed",
            message: "The following transactions failed",
            details: ["PAY01M718JCQBXD8V4JHS4PC7MYAB: high_risk"],
          },
        ],
      }),
    );

    await expect(
      MercadoPagoService.criarCobrancaPix({
        referencia: "GS-X",
        valorCentavos: 1990,
        descricao: "Individual",
        cliente: { nome: "Aluno", email: "a@b.com" },
      }),
    ).rejects.toBeInstanceOf(MercadoPagoErro);
  });

  it("motivoErro não perde o detalhe quando details é lista de strings", () => {
    const motivo = MercadoPagoService.motivoErro({
      errors: [
        {
          code: "failed",
          message: "The following transactions failed",
          details: ["PAY01M718JCQBXD8V4JHS4PC7MYAB: high_risk"],
        },
      ],
    });

    expect(motivo).toContain("high_risk");
    expect(motivo).toContain("PAY01M718JCQBXD8V4JHS4PC7MYAB");
  });

  it("motivoErro mantém o formato de objeto (property/message)", () => {
    const motivo = MercadoPagoService.motivoErro({
      errors: [{ code: "bad_request", details: { property: "total_amount", message: "invalid" } }],
    });

    expect(motivo).toContain("total_amount: invalid");
  });
});

describe("descreverRejeicaoMP", () => {
  const corpo = {
    errors: [
      {
        code: "failed",
        message: "The following transactions failed",
        details: ["PAY01M718JCQBXD8V4JHS4PC7MYAB: high_risk"],
      },
    ],
  };

  function erro(http: number, body: any) {
    return new MercadoPagoErro(`erro ${http}`, http, body);
  }

  it("traduz high_risk em motivo acionável em português", () => {
    const r = descreverRejeicaoMP(erro(402, corpo));

    expect(r.altoRisco).toBe(true);
    expect(r.codigo).toBe("mp_high_risk");
    expect(r.statusDetalhe).toBe("high_risk");
    expect(r.pagamentoId).toBe("PAY01M718JCQBXD8V4JHS4PC7MYAB");
    expect(r.http).toBe(402);
    expect(r.motivo).toMatch(/análise de risco/);
    expect(r.motivo).toMatch(/Nada foi cobrado/);
    expect(r.motivo).not.toMatch(/failed|transactions failed/i);
  });

  it("reconhece rejected_high_risk da Payments API", () => {
    const r = descreverRejeicaoMP(
      erro(201, { status: "rejected", status_detail: "rejected_high_risk" }),
    );

    expect(r.altoRisco).toBe(true);
    expect(r.statusDetalhe).toBe("rejected_high_risk");
  });

  it("credencial recusada tem mensagem própria", () => {
    const r = descreverRejeicaoMP(
      erro(401, { error: "invalid_credentials", message: "invalid" }),
    );

    expect(r.codigo).toBe("mp_credencial");
    expect(r.altoRisco).toBe(false);
    expect(r.motivo).toMatch(/credencial/i);
  });

  it("outras recusas não inventam causa", () => {
    const r = descreverRejeicaoMP(erro(500, { message: "boom" }));

    expect(r.codigo).toBe("mp_recusa");
    expect(r.altoRisco).toBe(false);
    expect(r.statusDetalhe).toBeUndefined();
    expect(r.motivo).toMatch(/HTTP 500/);
    expect(r.motivo).toMatch(/Nada foi cobrado/);
  });
});
