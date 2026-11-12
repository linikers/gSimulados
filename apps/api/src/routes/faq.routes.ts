import { Router } from "express";
import { FaqController } from "../controllers/faq.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { faqSchema } from "../schemas/faq.schema";

const router = Router();

// Público
router.get("/", FaqController.publico);

// Admin
router.use("/admin", authMiddleware, requireRole("admin"));
router.get("/admin", FaqController.listarAdmin);
router.post("/admin", validate(faqSchema), FaqController.criar);
router.post("/admin/seed", FaqController.seed);
router.put("/admin/:id", validate(faqSchema), FaqController.atualizar);
router.delete("/admin/:id", FaqController.remover);

export default router;
