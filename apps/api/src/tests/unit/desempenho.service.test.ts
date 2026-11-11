/**
 * Agregados do "Meu Desempenho": só tentativas do próprio aluno, matéria vinda
 * da questão e evolução em ordem cronológica.
 */

const leanMock = jest.fn();
const findMock = jest.fn();

jest.mock("../../models/Simulado", () => ({
  Simulado: {
    find: (...a: unknown[]) => findMock(...a),
  },
}));

jest.mock("../../models/Question", () => ({
  Question: { aggregate: jest.fn(), find: jest.fn() },
}));

jest.mock("../../services/gemini/gemini-client.service", () => ({
  gerarConteudoGemini: jest.fn(),
}));

import { SimuladoService } from "../../services/simulado.service";

beforeEach(() => {
  jest.clearAllMocks();
  const chain = {
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    lean: (...a: unknown[]) => leanMock(...a),
  };
  findMock.mockReturnValue(chain);
});

describe("SimuladoService.desempenho", () => {
  it("agrega só as tentativas do aluno, por matéria e em ordem", async () => {
    leanMock.mockResolvedValue([
      {
        _id: "s1",
        nome: "UEM Inverno 2023",
        questoes: [
          { _id: "q1", materia: "Matemática" },
          { _id: "q2", materia: "Química" },
        ],
        tentativas: [
          {
            aluno: "u1",
            finalizadoEm: new Date("2026-11-01T18:00:00Z"),
            respostas: [
              { questaoId: "q1", correta: true },
              { questaoId: "q2", correta: false },
            ],
          },
          {
            aluno: "u2",
            finalizadoEm: new Date("2026-11-02T18:00:00Z"),
            respostas: [{ questaoId: "q1", correta: false }],
          },
        ],
      },
      {
        _id: "s2",
        nome: "UEM Verão 2024",
        questoes: [{ _id: "q3", materia: "Matemática" }],
        tentativas: [
          {
            aluno: "u1",
            finalizadoEm: new Date("2026-11-10T18:00:00Z"),
            respostas: [{ questaoId: "q3", correta: true }],
          },
        ],
      },
    ]);

    const dados = await SimuladoService.desempenho("u1");

    expect(findMock).toHaveBeenCalledWith({ "tentativas.aluno": "u1" });
    expect(dados.totais).toEqual({
      simulados: 2,
      questoes: 3,
      acertos: 2,
      percentual: 67,
    });
    expect(dados.porMateria).toEqual([
      { materia: "Química", questoes: 1, acertos: 0, percentual: 0 },
      { materia: "Matemática", questoes: 2, acertos: 2, percentual: 100 },
    ]);
    // resultados: mais recente primeiro
    expect(dados.resultados[0].simuladoId).toBe("s2");
    // evolução: 10 últimos em ordem cronológica
    expect(dados.evolucao.map((e) => e.simuladoId)).toEqual(["s1", "s2"]);
  });

  it("devolve zeros quando o aluno não tem tentativa", async () => {
    leanMock.mockResolvedValue([]);

    const dados = await SimuladoService.desempenho("u1");

    expect(dados.totais).toEqual({
      simulados: 0,
      questoes: 0,
      acertos: 0,
      percentual: 0,
    });
    expect(dados.porMateria).toEqual([]);
    expect(dados.evolucao).toEqual([]);
  });
});
