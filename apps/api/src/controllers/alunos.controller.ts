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
      // If created by 'admin', escolaId must be provided in body
      else if (userRole === "admin") {
        if (!studentData.escolaId) {
          return res
            .status(400)
            .json({ error: "escolaId is required for admin" });
        }
      } else {
        return res.status(403).json({ error: "Permission denied" });
      }

      const { user } = await AuthService.register(studentData);

      res.status(201).json({ user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
