import { Request, Response, NextFunction } from "express";

/**
 * Garante que o usuário autenticado tenha um dos perfis informados.
 * Deve ser usado APÓS o authMiddleware.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: "Acesso negado" });
    }
    return next();
  };
}
