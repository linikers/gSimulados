import { Request, Response } from "express";
import { AuthService } from "../services/auth/auth.service";

export class AlunosController {
  static async create(req: Request, res: Response) {
    try {
      const { userRole, userId } = req;
      const studentData = { ...req.body, role: "aluno" };

      // If created by 'escola', force association with that school
      if (userRole === "escola") {
        studentData.escolaId = userId;
      }
      // Admin pode criar aluno com ou sem escola (aluno individual).
      // escolaId fica opcional e pode ser definido depois.
      else if (userRole !== "admin") {
        return res.status(403).json({ error: "Permission denied" });
      }

      if (studentData.escolaId === "") {
        delete studentData.escolaId;
      }

      const { user } = await AuthService.register(studentData);

      res.status(201).json({ user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  static async list(req: Request, res: Response) {
    try {
      const { User } = require("../models/User");
      const { userRole, userId } = req;
      let query: any = { role: "aluno" };

      if (userRole === "escola") {
        query.escolaId = userId;
      }

      const alunos = await User.find(query)
        .select("-password")
        .populate("escolaId", "name email"); // Populate school details if needed

      res.json(alunos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { User } = require("../models/User");
      const { userRole, userId } = req;

      let query: any = { _id: id, role: "aluno" };
      if (userRole === "escola") {
        query.escolaId = userId;
      }

      const updatedUser = await User.findOneAndUpdate(query, req.body, {
        new: true,
      }).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ error: "Aluno não encontrado" });
      }

      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { User } = require("../models/User");
      const { userRole, userId } = req;

      let query: any = { _id: id, role: "aluno" };
      if (userRole === "escola") {
        query.escolaId = userId;
      }

      const deletedUser = await User.findOneAndDelete(query);

      if (!deletedUser) {
        return res.status(404).json({ error: "Aluno não encontrado" });
      }

      res.json({ message: "Aluno removido com sucesso" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
