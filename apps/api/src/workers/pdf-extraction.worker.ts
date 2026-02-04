import { Worker, Job } from "bullmq";
import { redisConfig } from "../config/redis";
import { PDF_EXTRACTION_QUEUE } from "../queues/pdf-extraction.queue";
import { PdfSource } from "../models/PdfSource";
import { ExtractedQuestion } from "../models/ExtractedQuestion";
import { extractQuestionsFromPdf } from "../services/gemini-vision.service";
import { DriveService } from "../services/drive.service";

/**
 * Interface para os dados do trabalho de extração
 */
interface PdfExtractionJobData {
  pdfSourceId: string;
}

/**
 * Worker que processa a fila de extração de PDFs
 */
export const setupPdfExtractionWorker = () => {
  const worker = new Worker(
    PDF_EXTRACTION_QUEUE,
    async (job: Job<PdfExtractionJobData>) => {
      const { pdfSourceId } = job.data;

      console.log(`[Worker] Iniciando processamento do PDF: ${pdfSourceId}`);

      try {
        const pdfSource = await PdfSource.findById(pdfSourceId);
        if (!pdfSource) {
          throw new Error("PDF Source não encontrado");
        }

        // 1. Obter Buffer do PDF
        console.log(`[Worker] Baixando PDF do Drive: ${pdfSource.driveFileId}`);
        const pdfBuffer = await DriveService.downloadFile(
          pdfSource.driveFileId,
        );

        // 2. Extrair com Gemini
        console.log(`[Worker] Enviando para o Gemini...`);
        const extractionResult = await extractQuestionsFromPdf(
          pdfBuffer,
          pdfSource.vestibularCodigo,
        );

        // 3. Salvar questões extraídas
        const totalQuestions: any[] = [];
        for (const q of extractionResult.questoes) {
          const sanitizedResposta = q.respostaCorreta?.toUpperCase().trim();

          const extractedQ = await ExtractedQuestion.create({
            pdfSourceId: pdfSource._id,
            vestibularCodigo: pdfSource.vestibularCodigo,
            pageNumber: q.pageNumber || 1,
            numeroQuestao: q.numeroQuestao,
            enunciado: q.enunciado,
            alternativas: q.alternativas,
            respostaCorreta: sanitizedResposta,
            tipoQuestao: q.tipoQuestao || "multipla_escolha",
            temGabarito: q.temGabarito || false,
            materia: q.materia,
            assunto: q.assunto,
            temImagem: q.temImagem,
            confidence: extractionResult.confidence,
            status: "pending",
          });

          totalQuestions.push(extractedQ);
        }

        // 4. Atualizar registro do PDF
        await PdfSource.findByIdAndUpdate(pdfSourceId, {
          status: "completed",
          questoesExtraidas: totalQuestions.length,
          processedAt: new Date(),
        });

        console.log(
          `[Worker] Extração concluída com sucesso para o PDF: ${pdfSourceId}`,
        );
        return { success: true, count: totalQuestions.length };
      } catch (error: any) {
        console.error(`[Worker] Erro ao processar PDF ${pdfSourceId}:`, error);

        // Atualizar status de erro no banco
        await PdfSource.findByIdAndUpdate(pdfSourceId, {
          status: "error",
          errorMessage: error.message,
        });

        throw error; // Re-throw para o BullMQ lidar com falha do Job
      }
    },
    {
      connection: redisConfig.connection,
      concurrency: 2, // Processa até 2 PDFs simultaneamente
    },
  );

  worker.on("completed", (job: Job) => {
    console.log(`[Worker] Job ${job.id} concluído.`);
  });

  worker.on("failed", (job: Job | undefined, err: Error) => {
    console.log(`[Worker] Job ${job?.id} falhou: ${err.message}`);
  });

  console.log("[Worker] PDF Extraction Worker iniciado e aguardando tarefas.");
  return worker;
};
