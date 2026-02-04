import { Request, Response } from "express";
import { PdfSource } from "../models/PdfSource";
import { ExtractedQuestion } from "../models/ExtractedQuestion";
// import { extractQuestionsFromPdf } from "../services/gemini-vision.service";
// import { DriveService } from "../services/drive.service";
import { Question } from "../models/Question";
import { GeminiAuditService } from "../services/gemini-audit.service";
import { AuditLog } from "../models/AuditLog";
import { pdfExtractionQueue } from "../queues/pdf-extraction.queue";

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

  // Extrair questões de um PDF (via fila assíncrona)
  static async extractFromPdf(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const pdfSource = await PdfSource.findById(id);
      if (!pdfSource) {
        return res.status(404).json({ error: "PDF não encontrado" });
      }

      // 1. Atualizar status para processando
      await PdfSource.findByIdAndUpdate(id, {
        status: "processing",
        errorMessage: null, // Limpar erros anteriores
      });

      // 2. Limpar questões pendentes anteriores para este PDF (Redo/Retry)
      await ExtractedQuestion.deleteMany({
        pdfSourceId: id,
        status: "pending",
      });

      console.log(`[Queue] Adicionando PDF ${id} à fila de extração...`);

      // 3. Adicionar tarefa à fila
      const job = await pdfExtractionQueue.add(
        `extração-pdf-${id}`,
        {
          pdfSourceId: id,
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      res.json({
        message: "Extração iniciada em segundo plano",
        jobId: job.id,
        pdfId: id,
      });
    } catch (error: any) {
      console.error(`[Controller] Erro ao enfileirar extração:`, error);
      res.status(500).json({ error: error.message });
    }
  }

  // Listar questões pendentes para revisão
  static async listPendingQuestions(req: Request, res: Response) {
    try {
      const { vestibularCodigo } = req.query;
      const filter: any = { status: "pending" };
      if (vestibularCodigo) filter.vestibularCodigo = vestibularCodigo;

      const questions = await ExtractedQuestion.find(filter).sort({
        createdAt: 1,
      });
      res.json(questions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Aprovar questão
  static async approveQuestion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const editedData = req.body;

      const extracted =
        await ExtractedQuestion.findById(id).populate("pdfSourceId");
      if (!extracted) {
        return res.status(404).json({ error: "Questão não encontrada" });
      }

      // 1. Criar a questão real
      const pdfSource = extracted.pdfSourceId as any;

      // Tentar extrair ano do nome do arquivo (ex: "ENEM 2023.pdf")
      const yearMatch = pdfSource.fileName.match(/\d{4}/);
      const ano = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

      const newQuestion = await Question.create({
        enunciado: editedData.enunciado || extracted.enunciado,
        alternativas: editedData.alternativas || extracted.alternativas,
        respostaCorreta:
          editedData.respostaCorreta || extracted.respostaCorreta,
        materia: editedData.materia || extracted.materia || "Desconhecida",
        assunto: editedData.assunto || extracted.assunto || "Geral",
        dificuldade: editedData.dificuldade || extracted.dificuldade || "medio",
        origem: {
          vestibular: pdfSource.vestibularCodigo,
          ano: ano,
          prova: pdfSource.fileName.replace(".pdf", ""),
        },
        tags: editedData.tags || [],
      });

      // 1.1 Registrar Auditoria de Extração (IA vs Humano)
      const hasChanges =
        (editedData.enunciado &&
          editedData.enunciado !== extracted.enunciado) ||
        (editedData.respostaCorreta &&
          editedData.respostaCorreta !== extracted.respostaCorreta) ||
        (editedData.materia && editedData.materia !== extracted.materia) ||
        (editedData.assunto && editedData.assunto !== extracted.assunto) ||
        JSON.stringify(editedData.alternativas) !==
          JSON.stringify(extracted.alternativas);

      if (hasChanges) {
        console.log(
          `[Auditoria] Registrando correção manual para questão ${extracted.numeroQuestao}`,
        );
        await AuditLog.create({
          entityType: "question",
          entityId: newQuestion._id,
          action: "manual_correction",
          performedBy: (req as any).userId,
          details: {
            previousValue: {
              enunciado: extracted.enunciado,
              alternativas: extracted.alternativas,
              respostaCorreta: extracted.respostaCorreta,
              materia: extracted.materia,
              assunto: extracted.assunto,
            },
            newValue: {
              enunciado: newQuestion.enunciado,
              alternativas: newQuestion.alternativas,
              respostaCorreta: newQuestion.respostaCorreta,
              materia: newQuestion.materia,
              assunto: newQuestion.assunto,
            },
          },
        });
      } else {
        console.log(
          `[Auditoria] Questão ${extracted.numeroQuestao} aprovada sem correções.`,
        );
      }

      // 2. Atualizar status da extração
      extracted.status = "approved";
      extracted.questionId = newQuestion._id as any;
      extracted.reviewedAt = new Date();
      extracted.reviewedBy = (req as any).userId;
      await extracted.save();

      res.json({ message: "Questão aprovada e criada", question: newQuestion });
    } catch (error: any) {
      console.error("Erro ao aprovar questão:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Rejeitar questão
  static async rejectQuestion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const extracted = await ExtractedQuestion.findById(id);
      if (!extracted) {
        return res.status(404).json({ error: "Questão não encontrada" });
      }

      extracted.status = "rejected";
      extracted.reviewNotes = notes;
      extracted.reviewedAt = new Date();
      extracted.reviewedBy = (req as any).userId;
      await extracted.save();

      res.json({ message: "Questão rejeitada" });
    } catch (error: any) {
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

  // Auditar uma questão extraída
  static async auditExtractedQuestion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const extracted = await ExtractedQuestion.findById(id);

      if (!extracted) {
        return res.status(404).json({ error: "Questão não encontrada" });
      }

      const auditResult = await GeminiAuditService.auditQuestion(extracted);

      // Se a IA corrigiu o gabarito e estava vazio, atualiza
      if (
        auditResult.status === "corrected" ||
        (!extracted.respostaCorreta && auditResult.gabaritoCorreto)
      ) {
        extracted.respostaCorreta = auditResult.gabaritoCorreto;
        extracted.reviewNotes =
          (extracted.reviewNotes || "") +
          `\n[IA Audit] ${auditResult.feedback}`;
        await extracted.save();
      }

      res.json({
        message: "Auditoria concluída",
        auditResult,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
