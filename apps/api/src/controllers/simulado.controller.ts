import { Request, Response } from "express";
import { SimuladoService } from "../services/simulado.service";

export class SimuladoController {
  static async generate(req: Request, res: Response) {
    try {
      const { nome, materia, dificuldade, quantidade } = req.body;
      const usuarioId = req.userId;

      if (!nome || !quantidade) {
        return res
          .status(400)
          .json({ error: "Nome e quantidade são obrigatórios" });
      }

      const simulado = await SimuladoService.generate({
        nome,
        materia,
        dificuldade,
        quantidade,
        usuarioId,
      });

      res.status(201).json(simulado);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async listMySimulados(req: Request, res: Response) {
    try {
      const simulados = await SimuladoService.listByUser(req.userId);
      res.json(simulados);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getSimulado(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const simulado = await SimuladoService.getById(id);
      if (!simulado) {
        return res.status(404).json({ error: "Simulado não encontrado" });
      }

      const isOwner = String(simulado.usuario) === String(req.userId);
      if (!isOwner && req.userRole !== "admin") {
        return res.status(403).json({ error: "Acesso negado" });
      }

      res.json(simulado);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async submitAttempt(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { respostas } = req.body;

      if (!Array.isArray(respostas)) {
        return res
          .status(400)
          .json({ error: "respostas deve ser uma lista de respostas" });
      }

      const resultado = await SimuladoService.submitAttempt({
        simuladoId: id,
        alunoId: req.userId,
        respostas,
      });

      res.json(resultado);
    } catch (error: any) {
      const status = error.message === "Simulado não encontrado" ? 404 : 400;
      res.status(status).json({ error: error.message });
    }
  }
}
