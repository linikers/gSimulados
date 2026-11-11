/**
 * Confirmação manual de pagamento (admin).
 *
 * Regra que estes testes protegem: clique do admin só libera assinatura de
 * PIX manual pendente. Cobrança automática do gateway (Mercado Pago/PagBank)
 * nunca é "confirmada à mão" — antes disso, um PIX recusado com high_risk
 * virava acesso grátis e o admin nem via o motivo.
 */

const findByIdMock = jest.fn();
const renovarMock = jest.fn();
const userUpdateMock = jest.fn();

jest.mock("../../models/Pagamento", () => ({
  Pagamento: { findById: (...a: unknown[]) => findByIdMock(...a) },
}));

jest.mock("../../models/PixConfig", () => ({
  PixConfig: { findOne: jest.fn() },
}));

jest.mock("../../models/User", () => ({
  User: { findByIdAndUpdate: (...a: unknown[]) => userUpdateMock(...a) },
}));

jest.mock("../../services/assinatura.service", () => ({
  AssinaturaService: {
    acessoLiberado: jest.fn(),
    escolaPagante: jest.fn(),
    descontoDoAluno: jest.fn(),
    valorComDesconto: jest.fn(),
    renovar: (...a: unknown[]) => renovarMock(...a),
  },
}));

jest.mock("../../services/pagbank/pagbank-client.service", () => ({
  PagBankService: { criarPedido: jest.fn(), configurado: jest.fn() },
}));

jest.mock("../../services/mercadopago/mercadopago-client.service", () => {
  const real = jest.requireActual(
    "../../services/mercadopago/mercadopago-client.service",
  );
  return {
    ...real,
    MercadoPagoService: {
      ...real.MercadoPagoService,
      configurado: jest.fn(),
      criarCobrancaPix: jest.fn(),
    },
  };
});

import { PagamentosController } from "../../controllers/pagamentos.controller";

function pagamento(over: Record<string, unknown> = {}) {
  return {
    _id: "p1",
    usuario: "u1",
    plano: "individual_mensal",
    status: "pendente",
    gateway: "manual",
    valor: 19.9,
    save: jest.fn().mockResolvedValue(undefined),
    ...over,
  };
}

function resMock() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const req = { params: { id: "p1" }, userId: "admin1" } as any;

beforeEach(() => {
  jest.clearAllMocks();
  renovarMock.mockResolvedValue({ cicloFim: new Date("2026-12-11") });
  userUpdateMock.mockResolvedValue(null);
});

describe("PagamentosController.confirmar", () => {
  it("recusa confirmar cobrança do Mercado Pago (409) e não libera assinatura", async () => {
    findByIdMock.mockResolvedValue(
      pagamento({
        gateway: "mercadopago",
        statusDetalhe: "high_risk",
        motivoFalha: "Pagamento recusado por alto risco",
      }),
    );
    const res = resMock();

    await PagamentosController.confirmar(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ gateway: "mercadopago", statusDetalhe: "high_risk" }),
    );
    expect(renovarMock).not.toHaveBeenCalled();
    expect(userUpdateMock).not.toHaveBeenCalled();
  });

  it("recusa cobrança do PagBank (409)", async () => {
    findByIdMock.mockResolvedValue(pagamento({ gateway: "pagbank" }));
    const res = resMock();

    await PagamentosController.confirmar(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(renovarMock).not.toHaveBeenCalled();
  });

  it("confirma PIX manual pendente e renova a assinatura", async () => {
    const doc = pagamento();
    findByIdMock.mockResolvedValue(doc);
    const res = resMock();

    await PagamentosController.confirmar(req, res);

    expect(res.status).not.toHaveBeenCalledWith(409);
    expect(doc.status).toBe("pago");
    expect(doc.save).toHaveBeenCalled();
    expect(renovarMock).toHaveBeenCalledWith({
      usuarioId: "u1",
      plano: "individual_mensal",
    });
    expect(userUpdateMock).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ assinaturaAte: new Date("2026-12-11") }),
    );
  });

  it("aceita registro antigo sem gateway (era PIX manual)", async () => {
    findByIdMock.mockResolvedValue(pagamento({ gateway: undefined }));
    const res = resMock();

    await PagamentosController.confirmar(req, res);

    expect(res.status).not.toHaveBeenCalledWith(409);
    expect(renovarMock).toHaveBeenCalled();
  });

  it("não confirma pagamento já recusado (409)", async () => {
    findByIdMock.mockResolvedValue(
      pagamento({ gateway: "manual", status: "recusado" }),
    );
    const res = resMock();

    await PagamentosController.confirmar(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(renovarMock).not.toHaveBeenCalled();
  });

  it("pagamento já pago devolve 200 sem renovar de novo", async () => {
    findByIdMock.mockResolvedValue(pagamento({ status: "pago" }));
    const res = resMock();

    await PagamentosController.confirmar(req, res);

    expect(renovarMock).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });
});
