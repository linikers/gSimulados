import { Router } from "express";
import { WebhooksController } from "../controllers/webhooks.controller";

const router = Router();

// Sem autenticação: quem chama é o PagBank (não temos sessão dele). A segurança
// vem da referência única + idempotência + conferência de valor no service.
router.post("/pagbank", WebhooksController.pagbank);

export default router;
