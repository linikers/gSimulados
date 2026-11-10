/**
 * Checkout quando o Mercado Pago recusa a cobrança (402 `high_risk` em produção).
 *
 * Regra que estes testes protegem: aluno não fica sem saída. Com PIX manual
 * ativo o checkout responde 201 com a chave; sem ele, 502 com motivo em
 * português (nunca "failed — The following transactions failed") e a recusa
 * registrada para o admin (status_detail + id do pagamento).
 */

const escolaPaganteMock = jest.fn();
const descontoDoAlunoMock = jest.fn();
const pagamentoCreateMock = jest.fn();
const pixConfigFindOneMock = jest.fn();
const userFindByIdMock = jest.fn();
const mpConfiguradoMock = jest.fn();
const criarCobrancaPixMock = jest.fn();
const pagbankConfiguradoMock = jest.fn();

jest.mock("../../services/assinatura.service", () => ({
  AssinaturaService: {
    acessoLiberado: jest.fn(),
    escolaPagante: (...a: unknown[]) => escolaPaganteMock(...a),
    descontoDoAluno: (...a: unknown[]) => descontoDoAlunoMock(...a),
    valorComDesconto: (valor: number, desconto = 0) =>
      Math.round(valor * (1 - desconto / 100) * 100) / 100,
    renovar: jest.fn(),
  },
}));

jest.mock("../../services/pagbank/pagbank-client.service", () => ({
  PagBankService: {
    criarPedido: jest.fn(),
    configurado: () => pagbankConfiguradoMock(),
  },
}));

jest.mock("../../services/mercadopago/mercadopago-client.service", () => {
  const real = jest.requireActual(
    "../../services/mercadopago/mercadopago-client.service",
  );
  return {
    ...real,
    MercadoPagoService: {
      ...real.MercadoPagoService,
      configurado: () => mpConfiguradoMock(),
      criarCobrancaPix: (...a: unknown[]) => criarCobrancaPixMock(...a),
    },
  };
});

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

import { PagamentosController } from "../../controllers/pagamentos.controller";
import { MercadoPagoErro } from "../../services/mercadopago/mercadopago-client.service";

const PIX_ATIVO = {
  ativo: true,
  chave: "pix@gsimulados.com",
  nomeBeneficiario: "Liniker Ferreira",
  cidade: "Maringa",
  instrucoes: "Envie o comprovante no WhatsApp",
};

/** Corpo real do 402 da Orders API em produção. */
const CORPO_HIGH_RISK = {
  errors: [
    {
      code: "failed",
      message: "The following transactions failed",
      details: ["PAY01M718JCQBXD8V4JHS4PC7MYAB: high_risk"],
    },
  ],
};

function erroHighRisk() {
  return new MercadoPagoErro(
    "Mercado Pago recusou a requisição (402): failed — PAY01M718JCQBXD8V4JHS4PC7MYAB: high_risk",
    402,
    CORPO_HIGH_RISK,
  );
}

function respostaFake() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function reqFake(body: any = {}) {
  return {
    body,
    userId: "507f1f77bcf86cd799439011",
    userRole: "aluno",
  } as any;
}

beforeEach(() => {
  jest.clearAllMocks();
  mpConfiguradoMock.mockReturnValue(true);
  pagbankConfiguradoMock.mockReturnValue(false);
  escolaPaganteMock.mockResolvedValue(null);
  descontoDoAlunoMock.mockResolvedValue(0);
  userFindByIdMock.mockResolvedValue({
    _id: "507f1f77bcf86cd799439011",
    name: "Aluno Teste",
    email: "aluno@teste.com",
    taxId: "12345678909",
    save: jest.fn(),
  });
  pagamentoCreateMock.mockImplementation(async (doc: any) => ({
    _id: "pag-1",
    ...doc,
  }));
});

describe("checkout - MP recusa high_risk", () => {
  it("cai no PIX manual quando ele está ativo (201 com chave e instruções)", async () => {
    criarCobrancaPixMock.mockRejectedValue(erroHighRisk());
    pixConfigFindOneMock.mockResolvedValue(PIX_ATIVO);
    const res = respostaFake();

    await PagamentosController.checkout(reqFake({ plano: "individual" }), res);

    expect(res.status).toHaveBeenCalledWith(201);
    const corpo = res.json.mock.calls[0][0];
    expect(corpo.manual).toBe(true);
    expect(corpo.pix.chave).toBe("pix@gsimulados.com");
    expect(corpo.pix.instrucoes).toContain("comprovante");
    expect(corpo.fallback.codigo).toBe("mp_high_risk");
    expect(corpo.fallback.statusDetalhe).toBe("high_risk");

    const criado = pagamentoCreateMock.mock.calls[0][0];
    expect(criado.gateway).toBe("manual");
    expect(criado.status).toBe("pendente");
    expect(criado.statusDetalhe).toBe("high_risk");
    expect(criado.mercadopagoPaymentId).toBe("PAY01M718JCQBXD8V4JHS4PC7MYAB");
    expect(criado.motivoFalha).toMatch(/high_risk/);
  });

  it("sem PIX manual responde 502 com motivo legível e registra a recusa", async () => {
    criarCobrancaPixMock.mockRejectedValue(erroHighRisk());
    pixConfigFindOneMock.mockResolvedValue(null);
    const res = respostaFake();

    await PagamentosController.checkout(reqFake({ plano: "individual" }), res);

    expect(res.status).toHaveBeenCalledWith(502);
    const corpo = res.json.mock.calls[0][0];
    expect(corpo.motivo).toMatch(/análise de risco/);
    expect(corpo.motivo).toMatch(/high_risk/);
    expect(corpo.motivo).toMatch(/Nada foi cobrado/);
    expect(corpo.motivo).not.toMatch(/The following transactions failed/);
    expect(corpo.codigo).toBe("mp_high_risk");
    expect(corpo.statusDetalhe).toBe("high_risk");

    // O admin precisa enxergar a recusa no painel.
    const criado = pagamentoCreateMock.mock.calls[0][0];
    expect(criado.status).toBe("recusado");
    expect(criado.gateway).toBe("mercadopago");
    expect(criado.statusDetalhe).toBe("high_risk");
    expect(criado.mercadopagoPaymentId).toBe("PAY01M718JCQBXD8V4JHS4PC7MYAB");
    expect(criado.referencia).toMatch(/^GS-/);
  });

  it("PIX manual desligado no admin: 502 explica que o manual não está disponível", async () => {
    criarCobrancaPixMock.mockRejectedValue(erroHighRisk());
    pixConfigFindOneMock.mockResolvedValue({ ...PIX_ATIVO, ativo: false });
    const res = respostaFake();

    await PagamentosController.checkout(reqFake({ plano: "individual" }), res);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json.mock.calls[0][0].pixManualDisponivel).toBe(false);
  });

  it("falha genérica do MP (5xx) também cai no PIX manual", async () => {
    criarCobrancaPixMock.mockRejectedValue(
      new MercadoPagoErro("Falha ao falar com o Mercado Pago (502).", 502, null),
    );
    pixConfigFindOneMock.mockResolvedValue(PIX_ATIVO);
    const res = respostaFake();

    await PagamentosController.checkout(reqFake({ plano: "individual" }), res);

    expect(res.status).toHaveBeenCalledWith(201);
    const corpo = res.json.mock.calls[0][0];
    expect(corpo.manual).toBe(true);
    expect(corpo.fallback.codigo).toBe("mp_recusa");
    expect(corpo.pix.chave).toBe("pix@gsimulados.com");
  });

  it("cobrança aceita persiste status_detail e ids do MP", async () => {
    criarCobrancaPixMock.mockResolvedValue({
      pedidoId: "ORD-1",
      pagamentoId: "PAY-1",
      status: "pendente",
      statusBruto: "action_required",
      statusDetalhe: "pending_waiting_transfer",
      valorCentavos: 1990,
      referencia: "GS-ABC123",
      qrCodeTexto: "00020126...",
      qrCodeImagem: "data:image/png;base64,abc",
      bruto: {},
    });
    const res = respostaFake();

    await PagamentosController.checkout(reqFake({ plano: "individual" }), res);

    expect(res.status).toHaveBeenCalledWith(201);
    const criado = pagamentoCreateMock.mock.calls[0][0];
    expect(criado.gateway).toBe("mercadopago");
    expect(criado.mercadopagoPedidoId).toBe("ORD-1");
    expect(criado.mercadopagoPaymentId).toBe("PAY-1");
    expect(criado.statusDetalhe).toBe("pending_waiting_transfer");
  });
});
