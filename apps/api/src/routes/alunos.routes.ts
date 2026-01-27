import { Router } from "express";
import { AlunosController } from "../controllers/alunos.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, AlunosController.create);
router.get("/", authMiddleware, AlunosController.list);
router.put("/:id", authMiddleware, AlunosController.update);
router.delete("/:id", authMiddleware, AlunosController.delete);

export default router;
