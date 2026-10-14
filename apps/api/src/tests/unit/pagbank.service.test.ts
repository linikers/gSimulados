/**
 * Cliente PagBank — contrato e defesas.
 *
 * Nada aqui fala com a internet: o axios é mockado. Os casos cobrem o que a
 * documentação oficial exige (valores em centavos, tax_id obrigatório,
 * notification_urls) e o que não pode acontecer (liberar acesso por status
 * desconhecido, repetir erro de token, vazar o token no log).
 */

const postMock = jest.fn();
const getMock = jest.fn();
const createMock = jest.fn((config: unknown) => {
  void config;
  return { post: postMock, get: getMock };
});

jest.mock("axios", () => ({
  __esModule: true,
  default: { create: (config: unknown) => createMock(config) },
}));

import {
  PagBankErro,
  PagBankService,
  PAGBANK_PRODUCAO,
  PAGBANK_SANDBOX,
  statusInterno,
} from "../../services/pagbank/pagbank-client.service";

const cliente = {
  nome: "Aluno Teste",
  email: "aluno@teste.com",
  taxId: "12345678909",
};

const itens = [
  { nome: "Simulados - plano Individual", quantidade: 1, valorCentavos: 1990 },
];

function erroHttp(status: number, data: unknown = {}) {
  return Object.assign(new Error(`Request failed with status code ${status}`), {
    response: { status, data },
  });
}

function respostaOk(extra: Record<string, unknown> = {}) {
  return {
    data: {
      id: "ORDE_F87334AC",
      reference_id: "GS-ABC123",
      charges: [
        {
          id: "CHAR_F1F10115",
          status: "WAITING",
          amount: { value: 1990, currency: "BRL" },
          payment_method: { type: "PIX" },
        },
      ],
      qr_code: [
        {
          id: "QRCO_86FE51",
          text: "00020101021226600016BR.COM.PAGSEGURO...",
          links: [
            { rel: "QRCODE.PNG", href: "https://sandbox.api.pagseguro.com/qrcode/QRCO_86FE51/png" },
          ],
        },
      ],
      ...extra,
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.PAGBANK_TOKEN = "token-de-teste";
  process.env.PAGBANK_BASE_URL = PAGBANK_SANDBOX;
});

describe("PagBankService - configuração", () => {
  it("exige token configurado", async () => {
    delete process.env.PAGBANK_TOKEN;
    await expect(PagBankService.criarPedido({
      referencia: "GS-1",
      cliente,
      itens,
      metodo: "PIX",
    })).rejects.toThrow(/PAGBANK_TOKEN não configurado/);
    expect(postMock).not.toHaveBeenCalled();
  });

  it("usa sandbox por padrão e produção quando configurado", () => {
    delete process.env.PAGBANK_BASE_URL;
    expect(PagBankService.baseUrl()).toBe(PAGBANK_SANDBOX);
    expect(PagBankService.producao()).toBe(false);

    process.env.PAGBANK_BASE_URL = PAGBANK_PRODUCAO;
    expect(PagBankService.baseUrl()).toBe(PAGBANK_PRODUCAO);
    expect(PagBankService.producao()).toBe(true);
  });

  it("ignora barra final na base URL", () => {
    process.env.PAGBANK_BASE_URL = `${PAGBANK_SANDBOX}/`;
    expect(PagBankService.baseUrl()).toBe(PAGBANK_SANDBOX);
  });
});

describe("PagBankService - criarPedido (PIX)", () => {
  it("manda o payload que a API exige", async () => {
    postMock.mockResolvedValue(respostaOk());

    const pedido = await PagBankService.criarPedido({
      referencia: "GS-ABC123",
      cliente,
      itens,
      metodo: "PIX",
      descricao: "Plano Individual - outubro/2026",
      notificationUrls: ["https://gsimulados-api.fly.dev/webhooks/pagbank"],
    });

    expect(postMock).toHaveBeenCalledTimes(1);
    const [caminho, corpoEnviado] = postMock.mock.calls[0];
    expect(caminho).toBe("/orders");

    // valores em CENTAVOS (1990 = R$ 19,90) e moeda BRL
    expect(corpoEnviado.items[0].unit_amount).toBe(1990);
    expect(corpoEnviado.charges[0].amount).toEqual({ value: 1990, currency: "BRL" });

    // PIX com validade + webhook
    expect(corpoEnviado.charges[0].payment_method.type).toBe("PIX");
    expect(
      corpoEnviado.charges[0].payment_method.pix.expiration_date,
    ).toEqual(expect.any(String));
    expect(corpoEnviado.charges[0].notification_urls).toEqual([
      "https://gsimulados-api.fly.dev/webhooks/pagbank",
    ]);

    // tax_id em dígitos e referência nossa
    expect(corpoEnviado.customer.tax_id).toBe("12345678909");
    expect(corpoEnviado.reference_id).toBe("GS-ABC123");

    // resposta normalizada
    expect(pedido.status).toBe("pendente");
    expect(pedido.qrCodeTexto).toContain("00020101");
    expect(pedido.chargeId).toBe("CHAR_F1F10115");
    expect(pedido.valorCentavos).toBe(1990);
  });

  it("soma os itens no total da cobrança", async () => {
    postMock.mockResolvedValue(respostaOk());
    await PagBankService.criarPedido({
      referencia: "GS-2",
      cliente,
      itens: [
        { nome: "Plano", quantidade: 2, valorCentavos: 1990 },
        { nome: "Taxa", quantidade: 1, valorCentavos: 500 },
      ],
      metodo: "PIX",
    });
    expect(postMock.mock.calls[0][1].charges[0].amount.value).toBe(4480);
  });

  it("recusa CPF/CNPJ inválido sem chamar a API", async () => {
    await expect(PagBankService.criarPedido({
      referencia: "GS-3",
      cliente: { ...cliente, taxId: "" },
      itens,
      metodo: "PIX",
    })).rejects.toThrow(/CPF/);
    expect(postMock).not.toHaveBeenCalled();
  });

  it("recusa pedido sem itens", async () => {
    await expect(PagBankService.criarPedido({
      referencia: "GS-4",
      cliente,
      itens: [],
      metodo: "PIX",
    })).rejects.toThrow(/pelo menos um item/);
  });

  it("exige dados do cartão quando o método é cartão", async () => {
    await expect(PagBankService.criarPedido({
      referencia: "GS-5",
      cliente,
      itens,
      metodo: "CREDIT_CARD",
    })).rejects.toThrow(/cartão/);
  });

  it("envia cartão com parcelas quando informado", async () => {
    postMock.mockResolvedValue(respostaOk());
    await PagBankService.criarPedido({
      referencia: "GS-6",
      cliente,
      itens,
      metodo: "CREDIT_CARD",
      cartao: { numero: "4111111111111111", titular: "ALUNO TESTE", mes: "12", ano: "2030", cvv: "123", parcelas: 3 },
    });
    const cartao = postMock.mock.calls[0][1].charges[0].payment_method.credit_card;
    expect(cartao.installments).toBe(3);
    expect(cartao.card.number).toBe("4111111111111111");
  });
});

describe("PagBankService - status", () => {
  it("mapeia os status da API para os nossos", () => {
    expect(statusInterno("PAID")).toBe("pago");
    expect(statusInterno("AVAILABLE")).toBe("pago");
    expect(statusInterno("WAITING")).toBe("pendente");
    expect(statusInterno("IN_ANALYSIS")).toBe("pendente");
    expect(statusInterno("DECLINED")).toBe("recusado");
    expect(statusInterno("CANCELED")).toBe("cancelado");
    expect(statusInterno("EXPIRED")).toBe("expirado");
  });

  it("status desconhecido NÃO libera acesso", () => {
    expect(statusInterno("QUE_SEI_LA")).toBe("pendente");
    expect(statusInterno("")).toBe("pendente");
    expect(statusInterno(undefined as unknown as string)).toBe("pendente");
  });
});

describe("PagBankService - erros e retry", () => {
  it("401 explica token errado e não repete", async () => {
    postMock.mockRejectedValue(erroHttp(401, { error_messages: [{ description: "invalid token" }] }));
    await expect(PagBankService.criarPedido({
      referencia: "GS-7",
      cliente,
      itens,
      metodo: "PIX",
    })).rejects.toThrow(/token/i);
    expect(postMock).toHaveBeenCalledTimes(1);
  });

  it("400 do PagBank não repete", async () => {
    postMock.mockRejectedValue(erroHttp(400, { error_messages: [{ description: "invalid tax_id" }] }));
    await expect(PagBankService.criarPedido({
      referencia: "GS-8",
      cliente,
      itens,
      metodo: "PIX",
    })).rejects.toThrow(PagBankErro);
    expect(postMock).toHaveBeenCalledTimes(1);
  });

  it("500 repete e depois desiste", async () => {
    process.env.PAGBANK_TENTATIVAS = "2";
    postMock.mockRejectedValue(erroHttp(502));
    await expect(PagBankService.criarPedido({
      referencia: "GS-9",
      cliente,
      itens,
      metodo: "PIX",
    })).rejects.toThrow(/Falha ao falar com o PagBank/);
    expect(postMock).toHaveBeenCalledTimes(2);
    delete process.env.PAGBANK_TENTATIVAS;
  });
});

describe("PagBankService - consulta e cancelamento", () => {
  it("consulta pedido por id", async () => {
    getMock.mockResolvedValue(respostaOk({ charges: [{ id: "CHAR_1", status: "PAID", amount: { value: 1990 } }] }));
    const pedido = await PagBankService.consultarPedido("ORDE_F87334AC");
    expect(getMock.mock.calls[0][0]).toBe("/orders/ORDE_F87334AC");
    expect(pedido.status).toBe("pago");
  });

  it("cancela cobrança", async () => {
    postMock.mockResolvedValue({ data: { status: "CANCELED" } });
    const status = await PagBankService.cancelarCobranca("CHAR_1");
    expect(postMock.mock.calls[0][0]).toBe("/charges/CHAR_1/cancel");
    expect(status).toBe("cancelado");
  });
});
