import { Router } from "express";
import { PdfExtractionController } from "../controllers/pdf-extraction.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Todas as rotas protegidas (Admin only)
router.use(authMiddleware);

router.get("/pdfs", PdfExtractionController.listPdfs);
router.post("/pdfs/:id/extract", PdfExtractionController.extractFromPdf);
router.get("/stats", PdfExtractionController.getStats);

export default router;
