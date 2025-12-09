import { Request, Response } from "express";
import { Vestibular } from "../models/Vestibular";

export class VestibularesController {
  static async list(_req: Request, res: Response) {
    try {
      const vestibulares = await Vestibular.find({ ativo: true }).sort({
        ordem: 1,
      });
      res.json(vestibulares);
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
}
