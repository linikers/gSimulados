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
}
