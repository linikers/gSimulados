import { Router } from "express";
import { VestibularesController } from "../controllers/vestibulares.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Public routes
router.get("/", VestibularesController.list);
router.get("/:codigo", VestibularesController.getByCode);

// Protected routes (Admin only)
router.post("/", authMiddleware, VestibularesController.create);
router.put("/:codigo", authMiddleware, VestibularesController.update);
router.delete("/:codigo", authMiddleware, VestibularesController.delete);
router.post("/sync", authMiddleware, VestibularesController.sync);

export default router;
