import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  loginLimiter,
  refreshLimiter,
  registerLimiter,
} from "../middlewares/rate-limit.middleware";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
} from "../schemas/auth.schema";

const router = Router();

router.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  AuthController.register,
);
router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  AuthController.login,
);
router.post(
  "/refresh",
  refreshLimiter,
  validate(refreshSchema),
  AuthController.refresh,
);
router.post("/logout", AuthController.logout);

export default router;
