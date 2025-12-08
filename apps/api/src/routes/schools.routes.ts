import { Router } from "express";
import { SchoolsController } from "../controllers/schools.controller";

const router = Router();

// TODO: Add AuthMiddleware and AdminGuard here
router.post("/", SchoolsController.create);

export default router;
