import { Request, Response } from "express";
import { Vestibular } from "../models/Vestibular";
import { Question } from "../models/Question";

export class VestibularesController {
  static async list(_req: Request, res: Response) {
    try {
      const [vestibulares, contagens] = await Promise.all([
        Vestibular.find({ ativo: true }).sort({ ordem: 1 }),
        // Quantas questões aprovadas existem por vestibular. O gerador usa isso
        // para não oferecer um vestibular que devolveria 404.
        Question.aggregate([
          { $group: { _id: "$origem.vestibular", total: { $sum: 1 } } },
        ]),
      ]);

      const porCodigo = new Map(
        contagens.map((c) => [String(c._id ?? "").toLowerCase(), c.total]),
      );

      res.json(
        vestibulares.map((v) => ({
          ...v.toObject(),
          questoesCount: porCodigo.get(v.codigo.toLowerCase()) ?? 0,
        })),
      );
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByCode(req: Request, res: Response) {
    try {
      const vestibular = await Vestibular.findOne({
        codigo: req.params.codigo,
        ativo: true,
      });
      if (!vestibular) {
        return res.status(404).json({ error: "Vestibular não encontrado" });
      }
      res.json(vestibular);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const vestibular = await Vestibular.create(req.body);
      res.status(201).json(vestibular);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const vestibular = await Vestibular.findOneAndUpdate(
        { codigo: req.params.codigo },
        req.body,
        { new: true }
      );
      if (!vestibular) {
        return res.status(404).json({ error: "Vestibular não encontrado" });
      }
      res.json(vestibular);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const vestibular = await Vestibular.findOneAndDelete({
        codigo: req.params.codigo,
      });
      if (!vestibular) {
        return res.status(404).json({ error: "Vestibular não encontrado" });
      }
      res.json({ message: "Vestibular removido com sucesso" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async sync(_req: Request, res: Response) {
    try {
      const { syncVestibulares } = require("../services/scraping.service");
      const result = await syncVestibulares();
      res.json({
        message: "Sincronização concluída",
        ...result,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
