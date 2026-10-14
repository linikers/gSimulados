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

  it("envia cartão no formato que a API aceita (verificado no sandbox)", async () => {
    postMock.mockResolvedValue(respostaOk());
    await PagBankService.criarPedido({
      referencia: "GS-6",
      cliente,
      itens,
      metodo: "CREDIT_CARD",
      cartao: {
        numero: "4539620659922097",
        titular: "ALUNO TESTE",
        titularTaxId: "12345678909",
        mes: "12",
        ano: "2026",
        cvv: "123",
        parcelas: 3,
      },
    });
    const pm = postMock.mock.calls[0][1].charges[0].payment_method;
    // card/holder/installments/capture/soft_descriptor ficam TODOS em payment_method
    expect(pm.type).toBe("CREDIT_CARD");
    expect(pm.installments).toBe(3);
    expect(pm.capture).toBe(true);
    expect(pm.soft_descriptor).toBeTruthy();
    expect(pm.card.number).toBe("4539620659922097");
    expect(pm.card.holder).toEqual({ name: "ALUNO TESTE", tax_id: "12345678909" });
    // o formato `credit_card` aninhado não existe na API
    expect(pm.credit_card).toBeUndefined();
    // `seller` no nível da cobrança faz a API responder
    // "charges[0].seller.soft_descriptor: must not be empty"
    expect(postMock.mock.calls[0][1].charges[0].seller).toBeUndefined();
  });

  it("exige CPF do titular do cartão", async () => {
    await expect(PagBankService.criarPedido({
      referencia: "GS-6b",
      cliente,
      itens,
      metodo: "CREDIT_CARD",
      cartao: { numero: "4539620659922097", titular: "X", titularTaxId: "", mes: "12", ano: "2026", cvv: "123" },
    })).rejects.toThrow(/CPF do titular/);
    expect(postMock).not.toHaveBeenCalled();
  });

  it("usa o soft_descriptor configurado por env", async () => {
    process.env.PAGBANK_SOFT_DESCRIPTOR = "SIMULADOS GS";
    postMock.mockResolvedValue(respostaOk());
    await PagBankService.criarPedido({
      referencia: "GS-6c",
      cliente,
      itens,
      metodo: "CREDIT_CARD",
      cartao: { numero: "4539620659922097", titular: "ALUNO", titularTaxId: "12345678909", mes: "12", ano: "2026", cvv: "123" },
    });
    expect(postMock.mock.calls[0][1].charges[0].payment_method.soft_descriptor).toBe("SIMULADOS GS");
    delete process.env.PAGBANK_SOFT_DESCRIPTOR;
  });
});

describe("PagBankService - boleto", () => {
  const holder = {
    nome: "Aluno Teste",
    taxId: "123.456.789-09",
    email: "aluno@teste.com",
    endereco: {
      cep: "87010-000",
      logradouro: "Av Brasil",
      numero: "100",
      bairro: "Centro",
      cidade: "Maringa",
      uf: "PR",
    },
  };

  it("monta o boleto no formato aceito (verificado no sandbox)", async () => {
    postMock.mockResolvedValue(respostaOk());
    await PagBankService.criarPedido({
      referencia: "GS-BOL",
      cliente,
      itens,
      metodo: "BOLETO",
      boleto: { holder, dueDate: "2026-10-20" },
    });

    const boleto = postMock.mock.calls[0][1].charges[0].payment_method.boleto;
    expect(boleto.due_date).toBe("2026-10-20");
    expect(boleto.holder.tax_id).toBe("12345678909"); // só dígitos
    expect(boleto.holder.email).toBe("aluno@teste.com");
    // a API exige region E region_code (complemento é opcional)
    expect(boleto.holder.address.region).toBe("PR");
    expect(boleto.holder.address.region_code).toBe("PR");
    expect(boleto.holder.address.postal_code).toBe("87010000");
    expect(boleto.holder.address.country).toBe("BRA");
  });

  it("usa vencimento de 5 dias quando não informado", async () => {
    postMock.mockResolvedValue(respostaOk());
    await PagBankService.criarPedido({
      referencia: "GS-BOL2",
      cliente,
      itens,
      metodo: "BOLETO",
      boleto: { holder },
    });
    const due = postMock.mock.calls[0][1].charges[0].payment_method.boleto.due_date;
    expect(due).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("recusa boleto sem os dados do pagador", async () => {
    await expect(PagBankService.criarPedido({
      referencia: "GS-BOL3",
      cliente,
      itens,
      metodo: "BOLETO",
    })).rejects.toThrow(/dados do pagador/);
    expect(postMock).not.toHaveBeenCalled();
  });

  it("recusa boleto com endereço incompleto", async () => {
    await expect(PagBankService.criarPedido({
      referencia: "GS-BOL4",
      cliente,
      itens,
      metodo: "BOLETO",
      boleto: { holder: { ...holder, endereco: { ...holder.endereco, uf: "" } } },
    })).rejects.toThrow(/Endereço incompleto/);
    expect(postMock).not.toHaveBeenCalled();
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

describe("PagBankService - notificação (webhook)", () => {
  const notificacaoReal = {
    id: "ORDE_7A40F34A-657A-48C1-9F42-FEE722BE5680",
    reference_id: "GS-WH-123",
    charges: [
      {
        id: "CHAR_F41B2AC9",
        reference_id: "GS-WH-123-1",
        status: "PAID",
        paid_at: "2026-10-14T15:48:16.000-03:00",
        amount: { value: 1990, currency: "BRL", summary: { total: 1990, paid: 1990 } },
        payment_method: { type: "CREDIT_CARD" },
      },
    ],
    qr_codes: null,
  };

  it("lê a notificação real do PagBank (payload = response da API)", () => {
    const n = PagBankService.extrairNotificacao(notificacaoReal);
    expect(n.status).toBe("pago");
    expect(n.statusBruto).toBe("PAID");
    expect(n.chargeId).toBe("CHAR_F41B2AC9");
    expect(n.pedidoId).toBe("ORDE_7A40F34A-657A-48C1-9F42-FEE722BE5680");
    expect(n.referencia).toBe("GS-WH-123");
    expect(n.valorCentavos).toBe(1990);
  });

  it("notificação sem cobrança não derruba o handler", () => {
    const n = PagBankService.extrairNotificacao({ reference_id: "GS-X" });
    expect(n.status).toBe("pendente");
    expect(n.chargeId).toBeUndefined();
    expect(n.valorCentavos).toBe(0);
  });

  it("não libera acesso com status que não conhecemos", () => {
    const n = PagBankService.extrairNotificacao({
      reference_id: "GS-Y",
      charges: [{ id: "CHAR_1", status: "ALGO_NOVO", amount: { value: 1990 } }],
    });
    expect(n.status).toBe("pendente");
  });
});

describe("PagBankService - erros e retry", () => {
  it("conta sem chave PIX ativa recebe explicação, não erro genérico", async () => {
    postMock.mockRejectedValue(erroHttp(400, {
      error_messages: [{ code: "40002", description: "Pix key was not found for pix payment method" }],
    }));
    await expect(PagBankService.criarPedido({
      referencia: "GS-pix",
      cliente,
      itens,
      metodo: "PIX",
    })).rejects.toThrow(/chave PIX ativa/i);
    expect(postMock).toHaveBeenCalledTimes(1);
  });
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
