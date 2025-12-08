import { Router } from "express";
import { AlunosController } from "../controllers/alunos.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, AlunosController.create);

export default router;
