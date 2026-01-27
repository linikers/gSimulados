import { Request, Response } from "express";
import { AuthService } from "../services/auth/auth.service";
import { User } from "../models/User";

export class SchoolsController {
  static async create(req: Request, res: Response) {
    try {
      // Force role to be 'escola'
      const schoolData = { ...req.body, role: "escola" };

      const { user } = await AuthService.register(schoolData);

      // Admin doesn't need the token of the new school, just the user data
      res.status(201).json({ user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  static async list(_req: Request, res: Response) {
    try {
      const schools = await User.find({ role: "escola" }).select("-password");
      res.json(schools);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatedUser = await User.findOneAndUpdate(
        { _id: id, role: "escola" },
        req.body,
        { new: true },
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ error: "Escola não encontrada" });
      }

      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedUser = await User.findOneAndDelete({
        _id: id,
        role: "escola",
      });

      if (!deletedUser) {
        return res.status(404).json({ error: "Escola não encontrada" });
      }

      res.json({ message: "Escola removida com sucesso" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
