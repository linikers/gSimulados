/**
 * Regressão: POST /simulados/:id/attempt aceitava qualquer usuário
 * autenticado. O GET /simulados/:id já devolvia 403 para simulado de
 * terceiro; o attempt gravava a tentativa na prova alheia.
 */

const findByIdMock = jest.fn();

jest.mock("../../models/Question", () => ({
  Question: { aggregate: jest.fn() },
}));

jest.mock("../../models/Simulado", () => ({
  Simulado: {
    findById: (...args: unknown[]) => findByIdMock(...args),
  },
}));

jest.mock("../../services/gemini/gemini-client.service", () => ({
  gerarConteudoGemini: jest.fn(),
}));

import { SimuladoService } from "../../services/simulado.service";
import { SimuladoController } from "../../controllers/simulado.controller";

const DONO = "64b000000000000000000001";
const OUTRO_ALUNO = "64b000000000000000000002";
const ADMIN = "64b000000000000000000003";

const QUESTOES = [
  {
    _id: "64c000000000000000000001",
    enunciado: "Quanto é 1+1?",
    alternativas: { A: "1", B: "2" },
    respostaCorreta: "B",
  },
];

/** Simulado mockado com `questoes` já populadas e `save` observável. */
function simuladoDe(usuario: string) {
  return {
    _id: "64a000000000000000000001",
    usuario,
    questoes: QUESTOES,
    tentativas: [] as any[],
    save: jest.fn().mockResolvedValue(true),
  };
}

function popular(simulado: any) {
  findByIdMock.mockReturnValue({
    populate: jest.fn().mockResolvedValue(simulado),
  });
  return simulado;
}

const RESPOSTAS = [
  { questaoId: "64c000000000000000000001", respostaSelecionada: "B" },
];

describe("submitAttempt — dono do simulado", () => {
  beforeEach(() => findByIdMock.mockReset());

  it("barra tentativa no simulado de outro usuário com 403 e não grava nada", async () => {
    const simulado = popular(simuladoDe(DONO));

    await expect(
      SimuladoService.submitAttempt({
        simuladoId: String(simulado._id),
        alunoId: OUTRO_ALUNO,
        respostas: RESPOSTAS,
      }),
    ).rejects.toMatchObject({ message: "Acesso negado", status: 403 });

    expect(simulado.tentativas).toHaveLength(0);
    expect(simulado.save).not.toHaveBeenCalled();
  });

  it("mantém o fluxo do dono funcionando (corrige e grava a tentativa)", async () => {
    const simulado = popular(simuladoDe(DONO));

    const resultado = await SimuladoService.submitAttempt({
      simuladoId: String(simulado._id),
      alunoId: DONO,
      respostas: RESPOSTAS,
    });

    expect(resultado).toMatchObject({ total: 1, acertos: 1, erros: 0 });
    expect(simulado.tentativas).toHaveLength(1);
    expect(String(simulado.tentativas[0].aluno)).toBe(DONO);
    expect(simulado.save).toHaveBeenCalledTimes(1);
  });

  it("permite admin responder no simulado de um aluno", async () => {
    const simulado = popular(simuladoDe(DONO));

    await SimuladoService.submitAttempt({
      simuladoId: String(simulado._id),
      alunoId: ADMIN,
      respostas: RESPOSTAS,
      isAdmin: true,
    });

    expect(simulado.tentativas).toHaveLength(1);
    expect(simulado.save).toHaveBeenCalledTimes(1);
  });

  it("continua devolvendo 404 para simulado inexistente", async () => {
    findByIdMock.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    await expect(
      SimuladoService.submitAttempt({
        simuladoId: "64a0000000000000000000ff",
        alunoId: DONO,
        respostas: RESPOSTAS,
      }),
    ).rejects.toThrow("Simulado não encontrado");
  });
});

describe("SimuladoController.submitAttempt — resposta HTTP", () => {
  const chamarController = async (userId: string, role?: string) => {
    const req: any = {
      params: { id: "64a000000000000000000001" },
      body: { respostas: RESPOSTAS },
      userId,
      userRole: role,
    };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    await SimuladoController.submitAttempt(req, res);
    return res;
  };

  afterEach(() => jest.restoreAllMocks());

  it("devolve 403 quando o attempt vem de outro aluno", async () => {
    popular(simuladoDe(DONO));

    const res = await chamarController(OUTRO_ALUNO);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Acesso negado" });
  });

  it("devolve 200 para o dono", async () => {
    popular(simuladoDe(DONO));

    const res = await chamarController(DONO);

    expect(res.status).not.toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ acertos: 1 }),
    );
  });
});
