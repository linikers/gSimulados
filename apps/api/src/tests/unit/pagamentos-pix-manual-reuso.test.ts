/**
 * PIX manual: reuso da cobrança pendente e expiração (card t_5999e3c3).
 *
 * Regras que estes testes protegem:
 *  1. Três cliques em "Assinar com PIX" geram **uma** cobrança pendente — a
 *     segunda e a terceira devolvem a mesma referência (200, `reutilizado`).
 *     Em produção o aluno acumulou 67 pendentes, um por clique.
 *  2. Cobrança pendente com `expiraEm` no passado não é reutilizada e vira
 *     `expirado` (nenhum webhook do PIX manual faz essa transição).
 *  3. A cobrança manual não herda `statusDetalhe`/ids do Mercado Pago — o
 *     admin via "MP recusou: high_risk" numa cobrança legítima aguardando
 *     comprovante.
 *  4. A listagem do admin aceita `?status=` para mostrar só a fila pendente.
 */

/** Coleção falsa em memória — o reuso só é real se o filtro casar de fato. */
interface Doc {
  _id: string;
  usuario: unknown;
  plano: string;
  valor: number;
  metodo: string;
  gateway: string;
  status: string;
  referencia: string;
  expiraEm?: Date;
  criadoEm: Date;
  statusDetalhe?: string;
  mercadopagoPaymentId?: string;
  motivoFalha?: string;
}

const db: Doc[] = [];
let seq = 0;

function casar(doc: Doc, filtro: Record<string, any>): boolean {
  if (filtro.usuario && String(doc.usuario) !== String(filtro.usuario)) return false;
  if (filtro.plano && doc.plano !== filtro.plano) return false;
  if (filtro.metodo && doc.metodo !== filtro.metodo) return false;
  if (filtro.gateway && doc.gateway !== filtro.gateway) return false;
  if (filtro.status && doc.status !== filtro.status) return false;
  if (filtro.valor !== undefined && doc.valor !== filtro.valor) return false;
  if (filtro.expiraEm?.$gt) {
    if (!doc.expiraEm || doc.expiraEm.getTime() <= filtro.expiraEm.$gt.getTime()) {
      return false;
    }
  }
  if (filtro.expiraEm?.$lt) {
    if (!doc.expiraEm || doc.expiraEm.getTime() >= filtro.expiraEm.$lt.getTime()) {
      return false;
    }
  }
  return true;
}

const createMock = jest.fn(async (dados: any) => {
  const doc: Doc = {
    _id: `p${++seq}`,
    criadoEm: new Date(),
    ...dados,
  };
  db.push(doc);
  return doc;
});

const findOneMock = jest.fn((filtro: Record<string, any>) => ({
  sort: async () => {
    const achados = db.filter((d) => casar(d, filtro));
    return achados.length ? achados[achados.length - 1] : null;
  },
}));

const findMock = jest.fn((filtro: Record<string, any> = {}) => ({
  populate: () => ({
    sort: async () => db.filter((d) => casar(d, filtro)),
  }),
}));

const updateManyMock = jest.fn(async (filtro: Record<string, any>, op: any) => {
  let modifiedCount = 0;
  for (const doc of db) {
    if (casar(doc, filtro)) {
      Object.assign(doc, op.$set);
      modifiedCount++;
    }
  }
  return { modifiedCount };
});

const pixConfigFindOneMock = jest.fn();
const userFindByIdMock = jest.fn();
const mpConfiguradoMock = jest.fn();
const pagbankConfiguradoMock = jest.fn();
const criarCobrancaPixMock = jest.fn();
const escolaPaganteMock = jest.fn();
const descontoDoAlunoMock = jest.fn();

jest.mock("../../models/Pagamento", () => ({
  Pagamento: {
    create: (...a: unknown[]) => createMock(...(a as [any])),
    findOne: (...a: unknown[]) => findOneMock(...(a as [any])),
    find: (...a: unknown[]) => findMock(...(a as [any])),
    updateMany: (...a: unknown[]) => updateManyMock(...(a as [any, any])),
    findById: jest.fn(),
  },
}));

jest.mock("../../models/PixConfig", () => ({
  PixConfig: { findOne: (...a: unknown[]) => pixConfigFindOneMock(...a) },
}));

jest.mock("../../models/User", () => ({
  User: { findById: (...a: unknown[]) => userFindByIdMock(...a) },
}));

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

import { PagamentosController } from "../../controllers/pagamentos.controller";
import { MercadoPagoErro } from "../../services/mercadopago/mercadopago-client.service";

const PIX_ATIVO = {
  ativo: true,
  chave: "pix@gsimulados.com",
  nomeBeneficiario: "Liniker Ferreira",
  cidade: "Maringa",
  instrucoes: "Envie o comprovante no WhatsApp",
};

const USUARIO = "507f1f77bcf86cd799439011";

function respostaFake() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function reqFake(body: any = {}, query: any = {}) {
  return { body, query, userId: USUARIO, userRole: "aluno" } as any;
}

function erroHighRisk() {
  return new MercadoPagoErro(
    "Mercado Pago recusou a requisição (402): failed — PAY1: high_risk",
    402,
    { errors: [{ code: "failed", details: ["PAY1: high_risk"] }] },
  );
}

beforeEach(() => {
  db.length = 0;
  seq = 0;
  jest.clearAllMocks();
  // Gateways automáticos desligados: o caminho é o PIX manual.
  mpConfiguradoMock.mockReturnValue(false);
  pagbankConfiguradoMock.mockReturnValue(false);
  pixConfigFindOneMock.mockResolvedValue(PIX_ATIVO);
  escolaPaganteMock.mockResolvedValue(null);
  descontoDoAlunoMock.mockResolvedValue(0);
  userFindByIdMock.mockResolvedValue({
    _id: USUARIO,
    name: "Aluno Teste",
    email: "aluno@teste.com",
    taxId: "12345678909",
    save: jest.fn(),
  });
});

describe("PIX manual — reuso da cobrança pendente", () => {
  it("três cliques seguidos geram UMA cobrança pendente", async () => {
    const respostas = [];
    for (let i = 0; i < 3; i++) {
      const res = respostaFake();
      await PagamentosController.checkout(reqFake({ plano: "individual" }), res);
      respostas.push(res);
    }

    expect(db).toHaveLength(1);
    expect(createMock).toHaveBeenCalledTimes(1);

    // primeira cria (201), as seguintes devolvem a mesma referência (200)
    expect(respostas[0].status).toHaveBeenCalledWith(201);
    expect(respostas[1].status).toHaveBeenCalledWith(200);
    expect(respostas[2].status).toHaveBeenCalledWith(200);

    const referencias = respostas.map((r) => r.json.mock.calls[0][0].pagamento.referencia);
    expect(new Set(referencias).size).toBe(1);
    expect(respostas[1].json.mock.calls[0][0].reutilizado).toBe(true);
    expect(respostas[0].json.mock.calls[0][0].reutilizado).toBe(false);
  });

  it("cobrança pendente vencida não é reutilizada e vira `expirado`", async () => {
    const vencida = {
      _id: "velho",
      usuario: USUARIO,
      plano: "individual",
      valor: 19.9,
      metodo: "pix",
      gateway: "manual",
      status: "pendente",
      referencia: "GS-VELHO1",
      expiraEm: new Date(Date.now() - 60 * 60 * 1000),
      criadoEm: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    } as Doc;
    db.push(vencida);

    const res = respostaFake();
    await PagamentosController.checkout(reqFake({ plano: "individual" }), res);

    expect(vencida.status).toBe("expirado");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json.mock.calls[0][0].pagamento.referencia).not.toBe("GS-VELHO1");
    expect(db.filter((d) => d.status === "pendente")).toHaveLength(1);
  });

  it("a cobrança manual não herda statusDetalhe nem ids do Mercado Pago", async () => {
    mpConfiguradoMock.mockReturnValue(true);
    criarCobrancaPixMock.mockRejectedValue(erroHighRisk());

    const res = respostaFake();
    await PagamentosController.checkout(reqFake({ plano: "individual" }), res);

    expect(res.status).toHaveBeenCalledWith(201);
    const criado = createMock.mock.calls[0][0];
    expect(criado.gateway).toBe("manual");
    expect(criado.statusDetalhe).toBeUndefined();
    expect(criado.mercadopagoPaymentId).toBeUndefined();
    expect(criado.mercadopagoPedidoId).toBeUndefined();
    expect(criado.motivoFalha).toMatch(/high_risk/);

    // O detalhe técnico continua na resposta (para suporte/analytics).
    const corpo = res.json.mock.calls[0][0];
    expect(corpo.fallback.statusDetalhe).toBe("high_risk");
  });

  it("checkout expira pendentes vencidas antes de criar (updateMany)", async () => {
    const res = respostaFake();
    await PagamentosController.checkout(reqFake({ plano: "individual" }), res);

    expect(updateManyMock).toHaveBeenCalledTimes(1);
    const [filtro, op] = updateManyMock.mock.calls[0];
    expect(filtro.status).toBe("pendente");
    expect(filtro.expiraEm.$lt).toBeInstanceOf(Date);
    expect(op.$set.status).toBe("expirado");
  });
});

describe("listagem do admin — expiração e filtro", () => {
  function seed(status: string, extra: Partial<Doc> = {}) {
    db.push({
      _id: `id-${status}-${seq++}`,
      usuario: "u-x",
      plano: "individual",
      valor: 19.9,
      metodo: "pix",
      gateway: "manual",
      status,
      referencia: `GS-${status.toUpperCase()}`,
      criadoEm: new Date(),
      ...extra,
    } as Doc);
  }

  it("marca vencidas como expiradas ao listar", async () => {
    seed("pendente", { expiraEm: new Date(Date.now() - 1000) });
    seed("pendente", { expiraEm: new Date(Date.now() + 86400000) });

    const res = respostaFake();
    await PagamentosController.listarTodos(reqFake({}, {}) as any, res);

    const devolvidos: Doc[] = res.json.mock.calls[0][0];
    expect(devolvidos.map((p) => p.status).sort()).toEqual(["expirado", "pendente"]);
  });

  it("?status=pendente devolve só a fila pendente", async () => {
    seed("pendente", { expiraEm: new Date(Date.now() + 86400000) });
    seed("pago");
    seed("expirado");

    const res = respostaFake();
    await PagamentosController.listarTodos(
      reqFake({}, { status: "pendente" }) as any,
      res,
    );

    const devolvidos: Doc[] = res.json.mock.calls[0][0];
    expect(devolvidos).toHaveLength(1);
    expect(devolvidos[0].status).toBe("pendente");
  });

  it("não reutiliza pendente de valor diferente (preço/desconto mudou)", async () => {
    seed("pendente", { usuario: USUARIO, plano: "individual", valor: 999, expiraEm: new Date(Date.now() + 86400000) });
    // seed usa usuario "u-x"; alinha com o aluno do checkout
    db[0].usuario = USUARIO;

    const res = respostaFake();
    await PagamentosController.checkout(reqFake({ plano: "individual" }), res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(db.filter((d) => d.status === "pendente")).toHaveLength(2);
  });
});
