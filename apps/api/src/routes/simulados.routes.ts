import { Router } from "express";
import { SimuladoController } from "../controllers/simulado.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireAssinaturaAtiva } from "../middlewares/assinatura.middleware";

const router = Router();

// Todas as rotas de simulado exigem autenticação
router.use(authMiddleware);

// Gerar simulado é o recurso pago (402 sem assinatura ativa). Responder um
// simulado já criado continua livre — o aluno não perde o que já tem.
router.post(
  "/generate",
  requireAssinaturaAtiva,
  SimuladoController.generate,
);
router.get("/my", SimuladoController.listMySimulados);
router.post("/:id/attempt", SimuladoController.submitAttempt);
router.get("/:id", SimuladoController.getSimulado);

export default router;
