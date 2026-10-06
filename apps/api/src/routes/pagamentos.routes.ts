import { Router } from "express";
import { PagamentosController } from "../controllers/pagamentos.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

// Público
router.get("/planos", PagamentosController.listarPlanos);
router.get("/pix", PagamentosController.getPixPublico);

// Autenticado (aluno/escola/admin)
router.post("/checkout", authMiddleware, PagamentosController.checkout);
router.get("/meus", authMiddleware, PagamentosController.meusPagamentos);

// Admin
router.get("/config", authMiddleware, requireRole("admin"), PagamentosController.getPixConfig);
router.put("/config", authMiddleware, requireRole("admin"), PagamentosController.salvarPixConfig);
router.get("/", authMiddleware, requireRole("admin"), PagamentosController.listarTodos);
router.post("/:id/confirmar", authMiddleware, requireRole("admin"), PagamentosController.confirmar);

export default router;
