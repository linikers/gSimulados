import { Request, Response } from "express";
import { PdfSource } from "../models/PdfSource";
import { ExtractedQuestion } from "../models/ExtractedQuestion";

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

      const pdf = await PdfSource.findById(id);
      if (!pdf) {
        return res.status(404).json({ error: "PDF não encontrado" });
      }

      // Atualizar status
      await PdfSource.findByIdAndUpdate(id, { status: "processing" });

      // TODO: Implementar extração real com GPT-4 Vision
      // Por enquanto, cria questões mock

      const mockQuestions = [
        {
          pdfSourceId: pdf._id,
          vestibularCodigo: pdf.vestibularCodigo,
          pageNumber: 1,
          rawText: "Texto bruto da questão...",
          enunciado: "Qual é a capital do Brasil?",
          alternativas: [
            "A) São Paulo",
            "B) Rio de Janeiro",
            "C) Brasília",
            "D) Salvador",
            "E) Belo Horizonte",
          ],
          respostaCorreta: "C",
          materia: "Geografia",
          assunto: "Capitais",
          dificuldade: "facil",
          confidence: 95,
          temImagem: false,
          temFormula: false,
        },
      ];

      const extracted = await ExtractedQuestion.insertMany(mockQuestions);

      // Atualizar PDF
      await PdfSource.findByIdAndUpdate(id, {
        status: "completed",
        questoesExtraidas: extracted.length,
        processedAt: new Date(),
      });

      res.json({
        message: `${extracted.length} questões extraídas`,
        questions: extracted,
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
