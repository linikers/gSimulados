import { Request, Response } from "express";
import { PdfSource } from "../models/PdfSource";
import { ExtractedQuestion } from "../models/ExtractedQuestion";
import { convertPdfToImages } from "../services/pdf-processing.service";
import { uploadImage } from "../services/cloudinary.service";
import { extractQuestionsFromImage } from "../services/gemini-vision.service";
import { DriveService } from "../services/drive.service";

export class PdfExtractionController {
  // Listar PDFs
  static async listPdfs(req: Request, res: Response) {
    try {
      const { vestibularCodigo, status } = req.query;

      const filter: any = {};
      if (vestibularCodigo) filter.vestibularCodigo = vestibularCodigo;
      if (status) filter.status = status;

      const pdfs = await PdfSource.find(filter)
        .populate("driveConfigId")
        .sort({ createdAt: -1 });

      res.json(pdfs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Extrair questões de um PDF
  static async extractFromPdf(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const pdfSource = await PdfSource.findById(id);
      if (!pdfSource) {
        return res.status(404).json({ error: "PDF não encontrado" });
      }

      // Atualizar status
      await PdfSource.findByIdAndUpdate(id, { status: "processing" });

      console.log(
        `[Extraction] Iniciando download do PDF ${pdfSource.driveFileId}...`
      );
      // 1. Obter Buffer do PDF
      const pdfBuffer = await DriveService.downloadFile(pdfSource.driveFileId);
      console.log(
        `[Extraction] Download concluído. Tamanho: ${pdfBuffer.length} bytes`
      );

      if (pdfBuffer.length === 0) {
        throw new Error("Buffer do PDF vazio ou não implementado.");
      }

      // 2. Converter PDF para Imagens
      console.log(`[Extraction] Convertendo PDF para imagens...`);
      const images = await convertPdfToImages(pdfBuffer);
      console.log(`[Extraction] Conversão concluída: ${images.length} páginas`);
      const totalQuestions: any[] = [];

      // 3. Processar cada página
      for (const { pageNumber, imageBuffer } of images) {
        // Upload para Cloudinary (para obter URL pública para o frontend)
        const publicId = `questions/${pdfSource.vestibularCodigo}/${pdfSource._id}_page_${pageNumber}`;
        console.log(
          `[Extraction] Uploading page ${pageNumber} to Cloudinary...`
        );
        const imageUrl = await uploadImage(imageBuffer, "questions", publicId);
        console.log(`[Extraction] Upload OK: ${imageUrl}`);

        // Extrair com Gemini
        console.log(`[Extraction] Sending to Gemini...`);
        const extractionResult = await extractQuestionsFromImage(
          imageBuffer,
          pdfSource.vestibularCodigo
        );
        console.log(`[Extraction] Gemini response received.`);

        // Salvar questões
        for (const q of extractionResult.questoes) {
          const extractedQ = await ExtractedQuestion.create({
            pdfSourceId: pdfSource._id,
            vestibularCodigo: pdfSource.vestibularCodigo,
            pageNumber,
            enunciado: q.enunciado,
            alternativas: q.alternativas,
            respostaCorreta: q.respostaCorreta,
            materia: q.materia,
            assunto: q.assunto,
            temImagem: q.temImagem,
            imagemUrl: q.temImagem ? imageUrl : undefined, // Se a questão tem imagem, usamos a da página por enquanto (ou fazer crop futuro)
            imagemPublicId: q.temImagem ? publicId : undefined,
            confidence: extractionResult.confidence,
            status: "pending",
          });
          totalQuestions.push(extractedQ);
        }
      }

      // Atualizar PDF
      await PdfSource.findByIdAndUpdate(id, {
        status: "completed",
        questoesExtraidas: totalQuestions.length,
        processedAt: new Date(),
      });

      res.json({
        message: `${totalQuestions.length} questões extraídas com sucesso`,
        questions: totalQuestions,
      });
    } catch (error: any) {
      // Atualizar status de erro
      await PdfSource.findByIdAndUpdate(req.params.id, {
        status: "error",
        errorMessage: error.message,
      });

      res.status(500).json({ error: error.message });
    }
  }

  // Obter estatísticas
  static async getStats(_req: Request, res: Response) {
    try {
      const totalPdfs = await PdfSource.countDocuments();
      const pending = await PdfSource.countDocuments({ status: "pending" });
      const processing = await PdfSource.countDocuments({
        status: "processing",
      });
      const completed = await PdfSource.countDocuments({ status: "completed" });
      const error = await PdfSource.countDocuments({ status: "error" });

      const totalExtracted = await ExtractedQuestion.countDocuments();
      const pendingReview = await ExtractedQuestion.countDocuments({
        status: "pending",
      });
      const approved = await ExtractedQuestion.countDocuments({
        status: "approved",
      });

      res.json({
        pdfs: { total: totalPdfs, pending, processing, completed, error },
        questions: { total: totalExtracted, pendingReview, approved },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
