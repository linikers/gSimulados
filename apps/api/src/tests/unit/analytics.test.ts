/**
 * Resumo do analytics: contagens, funil de extração e receita.
 */
const countUsers = jest.fn();
const countQuestion = jest.fn();
const aggregateQuestion = jest.fn();
const countExtracted = jest.fn();
const countPdf = jest.fn();
const countSimulado = jest.fn();
const aggregateSimulado = jest.fn();
const countAssinatura = jest.fn();
const aggregatePagamento = jest.fn();
const countPagamento = jest.fn();

jest.mock("../../models/User", () => ({
  User: { countDocuments: (...a: unknown[]) => countUsers(...a) },
}));
jest.mock("../../models/Question", () => ({
  Question: {
    countDocuments: (...a: unknown[]) => countQuestion(...a),
    aggregate: (...a: unknown[]) => aggregateQuestion(...a),
  },
}));
jest.mock("../../models/ExtractedQuestion", () => ({
  ExtractedQuestion: { countDocuments: (...a: unknown[]) => countExtracted(...a) },
}));
jest.mock("../../models/PdfSource", () => ({
  PdfSource: { countDocuments: (...a: unknown[]) => countPdf(...a) },
}));
jest.mock("../../models/Simulado", () => ({
  Simulado: {
    countDocuments: (...a: unknown[]) => countSimulado(...a),
    aggregate: (...a: unknown[]) => aggregateSimulado(...a),
  },
}));
jest.mock("../../models/Assinatura", () => ({
  Assinatura: { countDocuments: (...a: unknown[]) => countAssinatura(...a) },
}));
jest.mock("../../models/Pagamento", () => ({
  Pagamento: {
    aggregate: (...a: unknown[]) => aggregatePagamento(...a),
    countDocuments: (...a: unknown[]) => countPagamento(...a),
  },
}));

import { AnalyticsController } from "../../controllers/analytics.controller";

function resMock() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
  countUsers.mockResolvedValue(10);
  countQuestion.mockResolvedValue(451);
  aggregateQuestion.mockResolvedValue([{ _id: "uem", total: 451 }]);
  countExtracted.mockResolvedValue(7);
  countPdf.mockResolvedValue(14);
  countSimulado.mockResolvedValue(3);
  aggregateSimulado.mockResolvedValue([{ _id: null, total: 5 }]);
  countAssinatura.mockResolvedValue(2);
  aggregatePagamento.mockResolvedValue([{ _id: null, total: 39.8 }]);
  countPagamento.mockResolvedValue(2);
});

describe("AnalyticsController.resumo", () => {
  it("devolve o resumo com receita e funil", async () => {
    const res = resMock();
    await AnalyticsController.resumo({} as any, res);

    const body = res.json.mock.calls[0][0];
    expect(body.usuarios.alunos).toBe(10);
    expect(body.questoes.total).toBe(451);
    expect(body.questoes.porVestibular[0]).toEqual({
      vestibular: "uem",
      total: 451,
    });
    expect(body.simulados.tentativas).toBe(5);
    expect(body.receita.total).toBe(39.8);
    expect(body.assinaturasAtivas).toBe(2);
    expect(body.extracao.pdfsProcessados).toBe(14);
  });

  it("sem dados, devolve zeros em vez de undefined", async () => {
    aggregateSimulado.mockResolvedValue([]);
    aggregatePagamento.mockResolvedValue([]);
    const res = resMock();

    await AnalyticsController.resumo({} as any, res);

    const body = res.json.mock.calls[0][0];
    expect(body.simulados.tentativas).toBe(0);
    expect(body.receita.total).toBe(0);
  });

  it("erro no banco vira 500 com mensagem", async () => {
    countUsers.mockRejectedValue(new Error("mongo fora"));
    const res = resMock();

    await AnalyticsController.resumo({} as any, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "mongo fora" });
  });
});
