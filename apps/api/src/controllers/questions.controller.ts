import { Request, Response } from "express";
import { Question } from "../models/Question";

/** Tamanho de página padrão/máximo da listagem paginada. */
export const PAGINA_PADRAO = 25;
export const PAGINA_MAXIMA = 100;

function parsePositivo(valor: unknown, fallback: number): number {
  const numero = Number.parseInt(String(valor), 10);
  if (!Number.isFinite(numero) || numero < 1) return fallback;
  return numero;
}

export class QuestionsController {
  static async create(req: Request, res: Response) {
    try {
      const question = await Question.create(req.body);
      res.status(201).json(question);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const { materia, dificuldade, vestibular, page, limit } = req.query;
      const filter: any = {};

      if (materia) filter.materia = materia;
      if (dificuldade) filter.dificuldade = dificuldade;
      if (vestibular) filter["origem.vestibular"] = vestibular;

      // Sem page/limit mantém o contrato antigo (array completo), usado por
      // consumidores que precisam da coleção inteira.
      const paginado = page !== undefined || limit !== undefined;

      if (!paginado) {
        const questions = await Question.find(filter).sort({ criadoEm: -1 });
        return res.json(questions);
      }

      const pagina = parsePositivo(page, 1);
      const porPagina = Math.min(
        parsePositivo(limit, PAGINA_PADRAO),
        PAGINA_MAXIMA,
      );

      const [items, total] = await Promise.all([
        Question.find(filter)
          .sort({ criadoEm: -1 })
          .skip((pagina - 1) * porPagina)
          .limit(porPagina),
        Question.countDocuments(filter),
      ]);

      return res.json({
        items,
        total,
        page: pagina,
        limit: porPagina,
        totalPages: Math.max(1, Math.ceil(total / porPagina)),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /** Matérias distintas, para o filtro da listagem (não depende da página). */
  static async materias(_req: Request, res: Response) {
    try {
      const materias = (await Question.distinct("materia")) as string[];
      res.json(
        materias
          .filter((materia) => typeof materia === "string" && materia.length > 0)
          .sort((a, b) => a.localeCompare(b, "pt-BR")),
      );
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const question = await Question.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ error: "Questão não encontrada" });
      }
      res.json(question);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const question = await Question.findByIdAndDelete(req.params.id);
      if (!question) {
        return res.status(404).json({ error: "Questão não encontrada" });
      }
      res.json({ message: "Questão removida com sucesso" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
