import { Router } from "express";
import { SchoolsController } from "../controllers/schools.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, SchoolsController.create);
router.get("/", authMiddleware, SchoolsController.list);
router.put("/:id", authMiddleware, SchoolsController.update);
router.delete("/:id", authMiddleware, SchoolsController.delete);

export default router;
