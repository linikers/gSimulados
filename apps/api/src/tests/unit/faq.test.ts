/**
 * FAQ: público só vê publicado/ordenado; seed não duplica conteúdo.
 */
const findMock = jest.fn();
const countMock = jest.fn();
const insertManyMock = jest.fn();
const createMock = jest.fn();
const findByIdAndDeleteMock = jest.fn();

jest.mock("../../models/Faq", () => ({
  Faq: {
    find: (...a: unknown[]) => findMock(...a),
    countDocuments: (...a: unknown[]) => countMock(...a),
    insertMany: (...a: unknown[]) => insertManyMock(...a),
    create: (...a: unknown[]) => createMock(...a),
    findByIdAndDelete: (...a: unknown[]) => findByIdAndDeleteMock(...a),
  },
}));

import { FaqController } from "../../controllers/faq.controller";

function resMock() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
}

function chain(resultado: unknown[]) {
  return {
    sort: jest.fn().mockResolvedValue(resultado),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FaqController", () => {
  it("público filtra publicado e categoria válida", async () => {
    const sort = jest.fn().mockResolvedValue([]);
    findMock.mockReturnValue({ sort });

    const res = resMock();
    await FaqController.publico(
      { query: { categoria: "aluno" } } as any,
      res,
    );

    expect(findMock).toHaveBeenCalledWith({
      publicado: true,
      categoria: "aluno",
    });
    expect(sort).toHaveBeenCalledWith({ ordem: 1, criadoEm: 1 });
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("categoria inválida não vira filtro", async () => {
    findMock.mockReturnValue(chain([]));
    await FaqController.publico(
      { query: { categoria: "hacker" } } as any,
      resMock(),
    );

    expect(findMock).toHaveBeenCalledWith({ publicado: true });
  });

  it("seed não duplica quando já existe conteúdo", async () => {
    countMock.mockResolvedValue(3);
    const res = resMock();

    await FaqController.seed({} as any, res);

    expect(insertManyMock).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ ok: true, criados: 0 });
  });

  it("seed insere o conteúdo inicial quando está vazio", async () => {
    countMock.mockResolvedValue(0);
    insertManyMock.mockResolvedValue([{}, {}, {}]);
    const res = resMock();

    await FaqController.seed({} as any, res);

    expect(insertManyMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ ok: true, criados: 3 });
  });

  it("remover item inexistente devolve 404", async () => {
    findByIdAndDeleteMock.mockResolvedValue(null);
    const res = resMock();

    await FaqController.remover({ params: { id: "x" } } as any, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
