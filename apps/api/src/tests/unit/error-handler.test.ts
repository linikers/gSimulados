/**
 * Middleware central de erro: status correto, campo do Mongoose e 500 sem
 * vazar stack/mensagem interna em produção.
 */
import { AppError } from "../../errors/AppError";
import {
  errorHandler,
  notFoundHandler,
} from "../../middlewares/error.middleware";

function resMock() {
  const res: any = { headersSent: false };
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("errorHandler", () => {
  const envOriginal = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = envOriginal;
    jest.restoreAllMocks();
  });

  it("usa o status do AppError e mantém a mensagem", () => {
    const res = resMock();
    errorHandler(new AppError("Pagamento não encontrado", 404), {} as any, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Pagamento não encontrado" });
  });

  it("CastError vira 400 de identificador inválido", () => {
    const res = resMock();
    const erro = Object.assign(new Error("cast"), { name: "CastError" });
    errorHandler(erro, {} as any, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Identificador inválido" });
  });

  it("ValidationError devolve os campos", () => {
    const res = resMock();
    const erro = Object.assign(new Error("validation"), {
      name: "ValidationError",
      errors: { email: { path: "email", message: "E-mail inválido" } },
    });
    errorHandler(erro, {} as any, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Dados inválidos",
      campos: [{ campo: "email", mensagem: "E-mail inválido" }],
    });
  });

  it("em produção, 500 não vaza a mensagem interna", () => {
    process.env.NODE_ENV = "production";
    const res = resMock();
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    errorHandler(new Error("ECONNREFUSED 10.0.0.1:27017"), {} as any, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erro interno do servidor" });
  });

  it("404 desconhecido responde JSON com o path", () => {
    const res = resMock();
    notFoundHandler({ originalUrl: "/nao-existe" } as any, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Rota não encontrada",
      path: "/nao-existe",
    });
  });
});
