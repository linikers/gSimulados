/**
 * Testes do gerador de simulado.
 *
 * Cada caso aqui corresponde a um defeito observado no gerador real
 * (medido em produção): prova repetida, menos questões que o pedido, figura
 * que nunca entrava e gabarito vazando para o aluno.
 */

const aggregateMock = jest.fn();
const gerarConteudoMock = jest.fn();

jest.mock("../../models/Question", () => ({
  Question: { aggregate: (...args: unknown[]) => aggregateMock(...args) },
}));

jest.mock("../../services/gemini/gemini-client.service", () => ({
  gerarConteudoGemini: (...args: unknown[]) => gerarConteudoMock(...args),
}));

const sortMock = jest.fn();
const populateMock = jest.fn();
const findMock = jest.fn();

jest.mock("../../models/Simulado", () => ({
  Simulado: class SimuladoMock {
    doc: any;
    constructor(doc: any) {
      this.doc = doc;
    }
    save() {
      return Promise.resolve({ _id: "simulado-1", ...this.doc });
    }
    static find(...args: unknown[]) {
      return findMock(...args);
    }
  },
}));

import { SimuladoService } from "../../services/simulado.service";

function poolDe(n: number, inicio = 0) {
  return Array.from({ length: n }, (_, i) => ({
    _id: { toString: () => `q${inicio + i}` },
    enunciado: `Enunciado ${inicio + i}`,
    materia: "Matemática",
    assunto: "Assunto",
    dificuldade: "medio",
  }));
}

/** Faz o mock de aggregate devolver o pool informado. */
function comPool(pool: any[]) {
  aggregateMock.mockResolvedValue(pool);
}

const base = { nome: "Prova", quantidade: 5, usuarioId: "507f1f77bcf86cd799439011" };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SimuladoService.generate - pool de questões", () => {
  it("sorteia com $sample (sem isso a prova se repete entre gerações)", async () => {
    comPool(poolDe(15));
    gerarConteudoMock.mockResolvedValue(JSON.stringify({ selectedIds: [] }));

    await SimuladoService.generate({ ...base, dificuldade: "misto" });

    const pipeline = aggregateMock.mock.calls[0][0];
    const etapa = pipeline.find((p: any) => p.$sample);
    expect(etapa).toBeDefined();
    expect(etapa.$sample.size).toBe(15);
  });

  it("dificuldade 'misto' não filtra dificuldade", async () => {
    comPool(poolDe(15));
    gerarConteudoMock.mockResolvedValue(JSON.stringify({ selectedIds: [] }));

    await SimuladoService.generate({ ...base, dificuldade: "misto" });

    const match = aggregateMock.mock.calls[0][0][0].$match;
    expect(match.dificuldade).toBeUndefined();
  });

  it("dificuldade específica filtra no banco", async () => {
    comPool(poolDe(15));
    gerarConteudoMock.mockResolvedValue(JSON.stringify({ selectedIds: [] }));

    await SimuladoService.generate({ ...base, dificuldade: "dificil" });

    const match = aggregateMock.mock.calls[0][0][0].$match;
    expect(match.dificuldade).toBe("dificil");
  });

  it("filtra por matéria e por vestibular (banca)", async () => {
    comPool(poolDe(15));
    gerarConteudoMock.mockResolvedValue(JSON.stringify({ selectedIds: [] }));

    await SimuladoService.generate({
      ...base,
      dificuldade: "misto",
      materia: "Física",
      vestibular: "UEM",
    });

    const match = aggregateMock.mock.calls[0][0][0].$match;
    expect(match.materia).toBe("Física");
    expect(match["origem.vestibular"]).toBe("uem");
  });

  it("erro claro quando o filtro não tem nenhuma questão", async () => {
    comPool([]);
    await expect(
      SimuladoService.generate({ ...base, dificuldade: "misto" }),
    ).rejects.toThrow(/Nenhuma questão encontrada/);
  });
});

describe("SimuladoService.generate - seleção da IA", () => {
  it("completa por sorteio quando a IA devolve menos do que foi pedido", async () => {
    comPool(poolDe(15));
    gerarConteudoMock.mockResolvedValue(
      JSON.stringify({ selectedIds: ["q0", "q1"] }),
    );

    const simulado: any = await SimuladoService.generate({
      ...base,
      dificuldade: "misto",
    });

    expect(simulado.questoes).toHaveLength(5);
    expect(simulado.quantidadeQuestoes).toBe(5);
    expect(new Set(simulado.questoes.map(String)).size).toBe(5);
  });

  it("ignora id que não existe no pool e repetido", async () => {
    comPool(poolDe(15));
    gerarConteudoMock.mockResolvedValue(
      JSON.stringify({ selectedIds: ["q0", "q0", "nao-existe", "q1"] }),
    );

    const simulado: any = await SimuladoService.generate({
      ...base,
      dificuldade: "misto",
    });

    expect(simulado.questoes.slice(0, 2).map(String)).toEqual(["q0", "q1"]);
    expect(new Set(simulado.questoes.map(String)).size).toBe(5);
  });

  it("cai no sorteio quando a IA devolve lista vazia", async () => {
    comPool(poolDe(15));
    gerarConteudoMock.mockResolvedValue(JSON.stringify({ selectedIds: [] }));

    const simulado: any = await SimuladoService.generate({
      ...base,
      dificuldade: "misto",
    });

    expect(simulado.questoes).toHaveLength(5);
  });

  it("cai no sorteio quando a IA falha (erro/exceção)", async () => {
    comPool(poolDe(15));
    gerarConteudoMock.mockRejectedValue(new Error("503 high demand"));

    const simulado: any = await SimuladoService.generate({
      ...base,
      dificuldade: "misto",
    });

    expect(simulado.questoes).toHaveLength(5);
  });

  it("nunca pede mais questões do que o pool tem", async () => {
    comPool(poolDe(3));
    gerarConteudoMock.mockResolvedValue(JSON.stringify({ selectedIds: [] }));

    const simulado: any = await SimuladoService.generate({
      ...base,
      quantidade: 20,
      dificuldade: "misto",
    });

    expect(simulado.questoes).toHaveLength(3);
    expect(simulado.quantidadeQuestoes).toBe(3);
  });
});

describe("SimuladoService - gabarito fora da resposta do aluno", () => {
  it("a listagem do aluno não traz respostaCorreta", async () => {
    const simuladoFake = {
      usuario: "u1",
      questoes: [
        { _id: "q1", enunciado: "E1", alternativas: ["A) 1"], respostaCorreta: "A" },
      ],
    };
    populateMock.mockResolvedValue([simuladoFake]);
    sortMock.mockReturnValue({ populate: populateMock });
    findMock.mockReturnValue({ sort: sortMock });

    const resultado: any = await SimuladoService.listByUser("u1");

    // populate com select negativo (defesa no nível da query)
    const argsPopulate = populateMock.mock.calls[0][0];
    expect(argsPopulate).toEqual({
      path: "questoes",
      select: "-respostaCorreta",
    });

    // e defesa no nível do payload
    const limpo: any = SimuladoService.semGabarito(resultado[0]);
    expect(limpo.questoes[0].respostaCorreta).toBeUndefined();
    expect(limpo.questoes[0].alternativas).toEqual(["A) 1"]);
    expect(limpo.questoes[0].enunciado).toBe("E1");
  });

  it("semGabarito não quebra com simulado vazio", () => {
    expect(SimuladoService.semGabarito({ questoes: [] }).questoes).toEqual([]);
    expect(SimuladoService.semGabarito(null)).toBeNull();
  });
});
