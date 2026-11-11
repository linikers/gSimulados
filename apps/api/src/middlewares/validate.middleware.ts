import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

type Origem = "body" | "query" | "params";

/**
 * Valida a entrada com zod antes do controller. Devolve 400 com o campo e a
 * mensagem em português — sem isso, um body faltando virava 500 ou um erro do
 * Mongoose na cara do aluno.
 */
export function validate(schema: ZodSchema, origem: Origem = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req[origem]);

    if (!resultado.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        campos: resultado.error.issues.map((issue) => ({
          campo: issue.path.join(".") || origem,
          mensagem: issue.message,
        })),
      });
    }

    // `req.query` é getter em algumas versões do Express; só troca o body.
    if (origem === "body") {
      req.body = resultado.data;
    }
    return next();
  };
}
