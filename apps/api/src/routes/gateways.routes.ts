import { Router } from "express";
import { GatewaysController } from "../controllers/gateways.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.use(authMiddleware, requireRole("admin"));

router.get("/", GatewaysController.status);
router.put("/:gateway", GatewaysController.salvar);
router.delete("/:gateway", GatewaysController.remover);

export default router;
