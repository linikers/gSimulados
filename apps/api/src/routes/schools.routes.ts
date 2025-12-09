import { Router } from "express";
import { SchoolsController } from "../controllers/schools.controller";

const router = Router();

// TODO: Add AuthMiddleware and AdminGuard here
router.post("/", SchoolsController.create);
router.get("/", SchoolsController.list);

export default router;
