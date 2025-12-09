import { Request, Response } from "express";
import { Question } from "../models/Question";

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
      const { materia, dificuldade, vestibular } = req.query;
      const filter: any = {};

      if (materia) filter.materia = materia;
      if (dificuldade) filter.dificuldade = dificuldade;
      if (vestibular) filter["origem.vestibular"] = vestibular;

      const questions = await Question.find(filter).sort({ criadoEm: -1 });
      res.json(questions);
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
