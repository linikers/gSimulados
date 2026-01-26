import { Request, Response } from "express";
import { SimuladoService } from "../services/simulado.service";

export class SimuladoController {
  static async generate(req: Request, res: Response) {
    try {
      const { nome, materia, dificuldade, quantidade } = req.body;
      const usuarioId = (req as any).user?.id || req.body.usuarioId; // Fallback se não houver auth middleware ainda

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
      const usuarioId = (req as any).user?.id || req.query.usuarioId;
      const simulados = await SimuladoService.listByUser(usuarioId as string);
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
      res.json(simulado);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
