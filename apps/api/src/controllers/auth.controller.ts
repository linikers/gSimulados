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
      const { user, token, refreshToken } = await AuthService.register(
        { ...req.body, role },
        req.headers["user-agent"],
      );
      res.status(201).json({ user, token, refreshToken });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { user, token, refreshToken } = await AuthService.login(
        req.body,
        req.headers["user-agent"],
      );
      res.json({ user, token, refreshToken });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  /** Troca o refresh por um access novo (rotação do refresh). */
  static async refresh(req: Request, res: Response) {
    try {
      const refreshToken = String(req.body?.refreshToken ?? "");
      if (!refreshToken) {
        return res.status(400).json({ error: "Informe o refreshToken" });
      }
      const dados = await AuthService.refresh(
        refreshToken,
        req.headers["user-agent"],
      );
      res.json(dados);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      await AuthService.logout(
        req.body?.refreshToken ? String(req.body.refreshToken) : undefined,
      );
      res.status(204).end();
    } catch {
      // Logout nunca deve prender o usuário: token inválido já está "fora".
      res.status(204).end();
    }
  }
}
