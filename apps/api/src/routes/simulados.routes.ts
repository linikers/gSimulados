import { Router } from "express";
import { SimuladoController } from "../controllers/simulado.controller";

const router = Router();

// TODO: Adicionar authMiddleware aqui no futuro
router.post("/generate", SimuladoController.generate);
router.get("/my", SimuladoController.listMySimulados);
router.get("/:id", SimuladoController.getSimulado);

export default router;
