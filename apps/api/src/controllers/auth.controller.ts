import { Request, Response } from "express";
import { AuthService } from "../services/auth/auth.service";

export class AuthController {
  // Perfis que podem ser escolhidos no cadastro publico.
  // 'admin' nunca pode vir do cliente.
  static async register(req: Request, res: Response) {
    try {
      const role = ["aluno", "escola"].includes(req.body?.role)
        ? req.body.role
        : "aluno";
      const { user, token } = await AuthService.register({
        ...req.body,
        role,
      });
      res.status(201).json({ user, token });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { user, token } = await AuthService.login(req.body);
      res.json({ user, token });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}
