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
import {
  esqueciSenhaSchema,
  redefinirSenhaSchema,
} from "../schemas/password-reset.schema";
import {
  esqueciSenhaLimiter,
  redefinirSenhaLimiter,
} from "../middlewares/rate-limit.middleware";

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
router.post(
  "/esqueci-senha",
  esqueciSenhaLimiter,
  validate(esqueciSenhaSchema),
  AuthController.esqueciSenha,
);
router.post(
  "/redefinir-senha",
  redefinirSenhaLimiter,
  validate(redefinirSenhaSchema),
  AuthController.redefinirSenha,
);
router.post("/logout", AuthController.logout);

export default router;
