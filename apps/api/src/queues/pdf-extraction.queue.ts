import { Queue } from "bullmq";
import { redisConfig } from "../config/redis";

// Nome da fila
export const PDF_EXTRACTION_QUEUE = "pdf-extraction-queue";

// Inicialização da fila
export const pdfExtractionQueue = new Queue(PDF_EXTRACTION_QUEUE, {
  connection: redisConfig.connection,
});

console.log(`[Queue] Fila '${PDF_EXTRACTION_QUEUE}' inicializada.`);
