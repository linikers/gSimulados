import { Request, Response } from "express";
import {
  DIFICULDADES,
  Dificuldade,
  SimuladoService,
} from "../services/simulado.service";

/** Teto de questões por simulado (evita pedido absurdo e custo de IA). */
const QUANTIDADE_MAXIMA = 100;

export class SimuladoController {
  static async generate(req: Request, res: Response) {
    try {
      const { nome, materia, vestibular } = req.body ?? {};
      // Dificuldade inválida (ou ausente) cai no padrão `misto`: antes o filtro
      // recebia `undefined` e a geração voltava vazia.
      const dificuldade: Dificuldade = DIFICULDADES.includes(
        req.body?.dificuldade,
      )
        ? req.body.dificuldade
        : "misto";
      const quantidade = Math.floor(Number(req.body?.quantidade));
      const usuarioId = req.userId;

      if (!nome) {
        return res.status(400).json({ error: "O nome é obrigatório" });
      }
      if (!Number.isFinite(quantidade) || quantidade < 1) {
        return res
          .status(400)
          .json({ error: "A quantidade deve ser um número maior que zero" });
      }

      const simulado = await SimuladoService.generate({
        nome,
        materia,
        vestibular,
        dificuldade,
        quantidade: Math.min(quantidade, QUANTIDADE_MAXIMA),
        usuarioId,
      });

      res.status(201).json(simulado);
    } catch (error: any) {
      // Filtro sem resultado é erro do pedido, não falha do servidor.
      const semQuestoes = /Nenhuma questão encontrada/.test(
        error?.message ?? "",
      );
      res.status(semQuestoes ? 404 : 500).json({ error: error.message });
    }
  }

  static async listMySimulados(req: Request, res: Response) {
    try {
      const simulados = await SimuladoService.listByUser(req.userId);
      // Aluno nunca recebe gabarito — o populate já filtra, isto é cinto e
      // suspensório contra mudança futura no select.
      res.json(simulados.map((s) => SimuladoService.semGabarito(s)));
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
      const isAdmin = req.userRole === "admin";
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: "Acesso negado" });
      }

      // Admin/professor mantém o gabarito; o aluno não.
      res.json(isAdmin ? simulado : SimuladoService.semGabarito(simulado));
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
