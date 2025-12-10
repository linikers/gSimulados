import { Router } from "express";
import { DriveConfigController } from "../controllers/drive-config.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Todas as rotas protegidas (Admin only)
router.use(authMiddleware);

router.get("/", DriveConfigController.list);
router.get("/:codigo", DriveConfigController.getByVestibular);
router.post("/", DriveConfigController.upsert);
router.post("/:codigo/sync", DriveConfigController.syncPdfs);
router.delete("/:codigo", DriveConfigController.delete);

export default router;
