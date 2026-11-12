import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

/** Rota que não existe responde JSON (antes o Express devolvia HTML). */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: "Rota não encontrada",
    path: req.originalUrl,
  });
}

/**
 * Tradutor único de erro → resposta HTTP.
 * - `AppError` usa o status declarado;
 * - erro de validação/cast do Mongoose vira 400 com o campo;
 * - o resto é 500, com a mensagem real escondida em produção.
 */
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) return next(err);

  let status: number = err?.statusCode ?? err?.status ?? 500;
  let mensagem: string = err?.message || "Erro inesperado";
  let campos: { campo: string; mensagem: string }[] | undefined;

  if (err instanceof AppError) {
    status = err.statusCode;
  } else if (err?.name === "CastError") {
    status = 400;
    mensagem = "Identificador inválido";
  } else if (err?.name === "ValidationError") {
    status = 400;
    mensagem = "Dados inválidos";
    campos = Object.values(err.errors ?? {}).map((e: any) => ({
      campo: e.path,
      mensagem: e.message,
    }));
  } else if (status >= 500) {
    console.error("[api] erro não tratado:", err);
    mensagem = "Erro interno do servidor";
  }

  const body: Record<string, unknown> = { error: mensagem };
  if (err?.code && typeof err.code === "string") body.code = err.code;
  if (campos?.length) body.campos = campos;
  if (status >= 500 && process.env.NODE_ENV !== "production" && err?.message) {
    body.detalhe = err.message;
  }

  res.status(status).json(body);
}
