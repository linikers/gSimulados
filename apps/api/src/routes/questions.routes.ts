import { Router } from "express";
import { QuestionsController } from "../controllers/questions.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Todas as rotas de questões devem ser protegidas (por enquanto)
router.use(authMiddleware);

router.post("/", QuestionsController.create);
router.get("/", QuestionsController.list);
router.get("/:id", QuestionsController.getById);
router.delete("/:id", QuestionsController.delete);

export default router;
