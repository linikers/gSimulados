import { Router } from "express";
import { SimuladoController } from "../controllers/simulado.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Todas as rotas de simulado exigem autenticação
router.use(authMiddleware);

router.post("/generate", SimuladoController.generate);
router.get("/my", SimuladoController.listMySimulados);
router.post("/:id/attempt", SimuladoController.submitAttempt);
router.get("/:id", SimuladoController.getSimulado);

export default router;
