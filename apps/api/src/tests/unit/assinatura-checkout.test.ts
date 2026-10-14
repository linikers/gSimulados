/**
 * Cobrança: middleware de assinatura + checkout no PagBank.
 *
 * Regra de negócio que estes testes protegem: **não existe acesso grátis**.
 * Sem assinatura vigente (ou escola pagando), o recurso responde 402.
 */

const acessoLiberadoMock = jest.fn();
const escolaPaganteMock = jest.fn();
const descontoDoAlunoMock = jest.fn();
const criarPedidoMock = jest.fn();
const configuradoMock = jest.fn();
const pagamentoCreateMock = jest.fn();
const pixConfigFindOneMock = jest.fn();
const userFindByIdMock = jest.fn();

jest.mock("../../services/assinatura.service", () => ({
  AssinaturaService: {
    acessoLiberado: (...a: unknown[]) => acessoLiberadoMock(...a),
    escolaPagante: (...a: unknown[]) => escolaPaganteMock(...a),
    descontoDoAluno: (...a: unknown[]) => descontoDoAlunoMock(...a),
    valorComDesconto: (valor: number, desconto = 0) =>
      Math.round(valor * (1 - desconto / 100) * 100) / 100,
    renovar: jest.fn(),
  },
}));

jest.mock("../../services/pagbank/pagbank-client.service", () => ({
  PagBankService: {
    criarPedido: (...a: unknown[]) => criarPedidoMock(...a),
    configurado: () => configuradoMock(),
  },
}));

jest.mock("../../models/Pagamento", () => ({
  Pagamento: {
    create: (...a: unknown[]) => pagamentoCreateMock(...a),
    find: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock("../../models/PixConfig", () => ({
  PixConfig: { findOne: () => pixConfigFindOneMock() },
}));

jest.mock("../../models/User", () => ({
  User: { findById: (...a: unknown[]) => userFindByIdMock(...a) },
}));

import { requireAssinaturaAtiva } from "../../middlewares/assinatura.middleware";
import { PagamentosController } from "../../controllers/pagamentos.controller";

function respostaFake() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function reqFake(body: any = {}, extra: any = {}) {
  return {
    body,
    userId: "507f1f77bcf86cd799439011",
    userRole: "aluno",
    ...extra,
  } as any;
}

beforeEach(() => {
  jest.clearAllMocks();
  prepararMocks();
});

function prepararMocks() {
  descontoDoAlunoMock.mockResolvedValue(0);
  escolaPaganteMock.mockResolvedValue(null);
  userFindByIdMock.mockResolvedValue({
    _id: "507f1f77bcf86cd799439011",
    name: "Aluno Teste",
    email: "aluno@teste.com",
    taxId: undefined,
    save: jest.fn().mockResolvedValue(undefined),
  });
  pagamentoCreateMock.mockImplementation(async (doc: any) => ({
    _id: "pag-1",
    ...doc,
  }));
}

describe("requireAssinaturaAtiva", () => {
  it("deixa passar quem tem assinatura vigente", async () => {
    acessoLiberadoMock.mockResolvedValue({ liberado: true, motivo: "assinatura_ativa" });
    const next = jest.fn();
    const res = respostaFake();

    await requireAssinaturaAtiva(reqFake(), res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("bloqueia quem não tem assinatura com 402 e motivo", async () => {
    acessoLiberadoMock.mockResolvedValue({ liberado: false, motivo: "sem_assinatura" });
    const next = jest.fn();
    const res = respostaFake();

    await requireAssinaturaAtiva(reqFake(), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(402);
    const corpo = res.json.mock.calls[0][0];
    expect(corpo.motivo).toBe("sem_assinatura");
    expect(corpo.checkout).toBe("/pagamentos/checkout");
  });

  it("aluno de escola com ciclo ativo passa sem cobrança", async () => {
    acessoLiberadoMock.mockResolvedValue({ liberado: true, motivo: "escola:abc" });
    const next = jest.fn();

    await requireAssinaturaAtiva(reqFake(), respostaFake(), next);

    expect(next).toHaveBeenCalled();
  });

  it("admin passa direto (não paga para operar o sistema)", async () => {
    const next = jest.fn();
    await requireAssinaturaAtiva(reqFake({}, { userRole: "admin" }), respostaFake(), next);
    expect(next).toHaveBeenCalled();
    expect(acessoLiberadoMock).not.toHaveBeenCalled();
  });
});

describe("checkout - validações", () => {
  it("recusa plano inexistente", async () => {
    const res = respostaFake();
    await PagamentosController.checkout(reqFake({ plano: "nao-existe" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("não existe plano gratuito no catálogo", async () => {
    const { PLANOS } = jest.requireActual("../../config/planos");
    expect(PLANOS.find((p: any) => p.codigo === "free")).toBeUndefined();
    expect(PLANOS.every((p: any) => p.preco > 0)).toBe(true);
  });

  it("recusa método não suportado (cartão entra depois, com criptografia)", async () => {
    const res = respostaFake();
    await PagamentosController.checkout(
      reqFake({ plano: "individual", metodo: "cartao" }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toMatch(/pix ou boleto/);
  });

  it("aluno coberto por escola não é cobrado (409)", async () => {
    escolaPaganteMock.mockResolvedValue({ escolaId: "escola-1" });
    const res = respostaFake();

    await PagamentosController.checkout(reqFake({ plano: "individual" }), res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(pagamentoCreateMock).not.toHaveBeenCalled();
  });
});

describe("checkout - cobrança no PagBank", () => {
  it("exige CPF/CNPJ quando o PagBank está configurado", async () => {
    configuradoMock.mockReturnValue(true);
    const res = respostaFake();

    await PagamentosController.checkout(reqFake({ plano: "individual" }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].campo).toBe("taxId");
    expect(criarPedidoMock).not.toHaveBeenCalled();
  });

  it("cria pedido PIX e devolve copia-e-cola", async () => {
    configuradoMock.mockReturnValue(true);
    criarPedidoMock.mockResolvedValue({
      pedidoId: "ORDE_1",
      chargeId: "CHAR_1",
      status: "pendente",
      statusBruto: "WAITING",
      valorCentavos: 1990,
      referencia: "GS-ABC123",
      qrCodeTexto: "00020101021226...",
      qrCodePngUrl: "https://sandbox.api.pagseguro.com/qrcode/QRCO/png",
    });
    const res = respostaFake();

    await PagamentosController.checkout(
      reqFake({ plano: "individual", taxId: "123.456.789-09" }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(201);
    const pedido = criarPedidoMock.mock.calls[0][0];
    expect(pedido.metodo).toBe("PIX");
    expect(pedido.itens[0].valorCentavos).toBe(1990);
    expect(pedido.cliente.taxId).toBe("12345678909"); // só dígitos
    expect(pedido.notificationUrls[0]).toMatch(/\/webhooks\/pagbank$/);

    const corpo = res.json.mock.calls[0][0];
    expect(corpo.pagbank.pix.copiaECola).toContain("000201");
    expect(pagamentoCreateMock.mock.calls[0][0].gateway).toBe("pagbank");
  });

  it("cria boleto quando o método é boleto", async () => {
    configuradoMock.mockReturnValue(true);
    criarPedidoMock.mockResolvedValue({
      pedidoId: "ORDE_2",
      chargeId: "CHAR_2",
      status: "pendente",
      valorCentavos: 49700,
      referencia: "GS-BOL",
      boletoBarcode: "03399853012970000024227020",
    });
    const res = respostaFake();

    await PagamentosController.checkout(
      reqFake({
        plano: "escola_small",
        metodo: "boleto",
        taxId: "12345678000199",
        enderecoCobranca: {
          cep: "87010000",
          logradouro: "Av Brasil",
          numero: "100",
          bairro: "Centro",
          cidade: "Maringa",
          uf: "PR",
        },
      }),
      res,
    );

    expect(criarPedidoMock.mock.calls[0][0].metodo).toBe("BOLETO");
    expect(criarPedidoMock.mock.calls[0][0].boleto.holder.taxId).toBe("12345678000199");
    expect(res.json.mock.calls[0][0].pagbank.boleto.linhaDigitavel).toContain("03399");
  });

  it("boleto sem endereço do pagador responde 400", async () => {
    configuradoMock.mockReturnValue(true);
    const res = respostaFake();

    await PagamentosController.checkout(
      reqFake({ plano: "individual", metodo: "boleto", taxId: "12345678909" }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].campo).toBe("enderecoCobranca");
    expect(criarPedidoMock).not.toHaveBeenCalled();
  });

  it("aplica o desconto da escola no valor cobrado", async () => {
    configuradoMock.mockReturnValue(true);
    descontoDoAlunoMock.mockResolvedValue(30);
    criarPedidoMock.mockResolvedValue({
      pedidoId: "ORDE_3",
      chargeId: "CHAR_3",
      status: "pendente",
      valorCentavos: 1393,
      referencia: "GS-DESC",
    });
    const res = respostaFake();

    await PagamentosController.checkout(
      reqFake({ plano: "individual", taxId: "12345678909" }),
      res,
    );

    // 19,90 - 30% = 13,93
    expect(criarPedidoMock.mock.calls[0][0].itens[0].valorCentavos).toBe(1393);
    const corpo = res.json.mock.calls[0][0];
    expect(corpo.descontoPercentual).toBe(30);
    expect(corpo.valorFinal).toBe(13.93);
  });
});

describe("checkout - fallback PIX manual", () => {
  it("sem token do PagBank usa o PIX manual (admin confere)", async () => {
    configuradoMock.mockReturnValue(false);
    pixConfigFindOneMock.mockResolvedValue({
      ativo: true,
      chave: "chave@pix.com",
      nomeBeneficiario: "Liniker",
      cidade: "Maringa",
      instrucoes: "envie o comprovante",
    });
    const res = respostaFake();

    await PagamentosController.checkout(reqFake({ plano: "individual" }), res);

    expect(res.status).toHaveBeenCalledWith(201);
    const corpo = res.json.mock.calls[0][0];
    expect(corpo.manual).toBe(true);
    expect(corpo.pix.chave).toBe("chave@pix.com");
    expect(pagamentoCreateMock.mock.calls[0][0].gateway).toBe("manual");
    expect(criarPedidoMock).not.toHaveBeenCalled();
  });

  it("sem PagBank e sem PIX manual configurado responde 503 (nada de acesso grátis)", async () => {
    configuradoMock.mockReturnValue(false);
    pixConfigFindOneMock.mockResolvedValue(null);
    const res = respostaFake();

    await PagamentosController.checkout(reqFake({ plano: "individual" }), res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(pagamentoCreateMock).not.toHaveBeenCalled();
  });
});
