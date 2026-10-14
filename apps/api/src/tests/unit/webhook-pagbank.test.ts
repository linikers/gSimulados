/**
 * Webhook do PagBank — o caminho do dinheiro.
 *
 * Todo caso aqui é sobre não liberar acesso por engano e não renovar duas
 * vezes. Payload usado nos testes = payload real capturado do sandbox.
 */

const findOneMock = jest.fn();
const createEventoMock = jest.fn();
const renovarMock = jest.fn();

jest.mock("../../models/Pagamento", () => ({
  Pagamento: { findOne: (...args: unknown[]) => findOneMock(...args) },
}));

jest.mock("../../models/EventoWebhook", () => ({
  EventoWebhook: { create: (...args: unknown[]) => createEventoMock(...args) },
}));

jest.mock("../../services/assinatura.service", () => ({
  AssinaturaService: { renovar: (...args: unknown[]) => renovarMock(...args) },
}));

import { PagBankWebhookService } from "../../services/pagbank/webhook.service";

const REF = "GS-WH-123";

function notificacao(status: string, valor = 1990) {
  return {
    id: "ORDE_7A40F34A",
    reference_id: REF,
    charges: [
      {
        id: "CHAR_F41B2AC9",
        reference_id: `${REF}-1`,
        status,
        paid_at: "2026-10-14T15:48:16.000-03:00",
        amount: { value: valor, currency: "BRL" },
        payment_method: { type: "CREDIT_CARD" },
      },
    ],
    qr_codes: null,
  };
}

function pagamentoFake(extra: Record<string, unknown> = {}): any {
  return {
    usuario: "507f1f77bcf86cd799439011",
    plano: "individual",
    valor: 19.9,
    status: "pendente",
    referencia: REF,
    save: jest.fn().mockResolvedValue(undefined),
    ...extra,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  createEventoMock.mockResolvedValue({});
  renovarMock.mockResolvedValue({ cicloFim: new Date("2026-11-13T00:00:00Z") });
});

describe("Webhook PagBank - pagamento confirmado", () => {
  it("marca como pago e renova a assinatura por um ciclo", async () => {
    const pagamento = pagamentoFake();
    findOneMock.mockResolvedValue(pagamento);

    const r = await PagBankWebhookService.processar(notificacao("PAID"));

    expect(r.resultado).toBe("pago");
    expect(pagamento.status).toBe("pago");
    expect(pagamento.pagoEm).toBeInstanceOf(Date);
    expect(pagamento.save).toHaveBeenCalledTimes(1);
    expect(renovarMock).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: pagamento.usuario, plano: "individual" }),
    );
  });

  it("guarda a cobrança do PagBank no pagamento", async () => {
    const pagamento = pagamentoFake({ pagbankChargeId: undefined });
    findOneMock.mockResolvedValue(pagamento);

    await PagBankWebhookService.processar(notificacao("PAID"));

    expect(pagamento.pagbankChargeId).toBe("CHAR_F41B2AC9");
    expect(pagamento.pagbankPedidoId).toBe("ORDE_7A40F34A");
  });

  it("procura o pagamento por referência, cobrança ou pedido", async () => {
    findOneMock.mockResolvedValue(pagamentoFake());
    await PagBankWebhookService.processar(notificacao("PAID"));
    const filtro = findOneMock.mock.calls[0][0];
    expect(filtro.$or).toEqual(
      expect.arrayContaining([
        { referencia: REF },
        { pagbankChargeId: "CHAR_F41B2AC9" },
        { pagbankPedidoId: "ORDE_7A40F34A" },
      ]),
    );
  });
});

describe("Webhook PagBank - proteções", () => {
  it("não processa a mesma notificação duas vezes (idempotência)", async () => {
    createEventoMock.mockRejectedValue(Object.assign(new Error("dup"), { code: 11000 }));

    const r = await PagBankWebhookService.processar(notificacao("PAID"));

    expect(r.resultado).toBe("duplicado");
    expect(findOneMock).not.toHaveBeenCalled();
    expect(renovarMock).not.toHaveBeenCalled();
  });

  it("valor pago diferente do cobrado NÃO libera acesso", async () => {
    const pagamento = pagamentoFake();
    findOneMock.mockResolvedValue(pagamento);

    const r = await PagBankWebhookService.processar(notificacao("PAID", 100));

    expect(r.resultado).toBe("valor_divergente");
    expect((r as any).esperadoCentavos).toBe(1990);
    expect((r as any).recebidoCentavos).toBe(100);
    expect(pagamento.status).toBe("pendente");
    expect(pagamento.save).not.toHaveBeenCalled();
    expect(renovarMock).not.toHaveBeenCalled();
  });

  it("status desconhecido não libera nada", async () => {
    const pagamento = pagamentoFake();
    findOneMock.mockResolvedValue(pagamento);

    const r = await PagBankWebhookService.processar(notificacao("ALGO_NOVO"));

    expect(r.resultado).toBe("ignorado");
    expect(pagamento.status).toBe("pendente");
    expect(renovarMock).not.toHaveBeenCalled();
  });

  it("cobrança que não é nossa não derruba nem libera", async () => {
    findOneMock.mockResolvedValue(null);

    const r = await PagBankWebhookService.processar(notificacao("PAID"));

    expect(r.resultado).toBe("nao_encontrado");
    expect(renovarMock).not.toHaveBeenCalled();
  });

  it("notificação inválida (sem charges) é ignorada", async () => {
    findOneMock.mockResolvedValue(pagamentoFake());

    const r = await PagBankWebhookService.processar({ reference_id: REF });

    expect(r.resultado).toBe("ignorado");
    expect(renovarMock).not.toHaveBeenCalled();
  });
});

describe("Webhook PagBank - recusa e cancelamento", () => {
  it("cartão negado marca recusado e não renova", async () => {
    const pagamento = pagamentoFake();
    findOneMock.mockResolvedValue(pagamento);

    const r = await PagBankWebhookService.processar(notificacao("DECLINED"));

    expect(r.resultado).toBe("recusado");
    expect(pagamento.status).toBe("recusado");
    expect(renovarMock).not.toHaveBeenCalled();
  });

  it("não sobrescreve pagamento já pago com um cancelamento posterior", async () => {
    const pagamento = pagamentoFake({ status: "pago" });
    findOneMock.mockResolvedValue(pagamento);

    const r = await PagBankWebhookService.processar(notificacao("CANCELED"));

    expect(r.resultado).toBe("cancelado");
    expect(pagamento.status).toBe("pago");
    expect(pagamento.save).not.toHaveBeenCalled();
  });
});
