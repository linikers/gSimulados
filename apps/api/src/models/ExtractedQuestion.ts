import mongoose, { Schema, Document } from "mongoose";

export interface IExtractedQuestion extends Document {
  pdfSourceId: mongoose.Types.ObjectId;
  vestibularCodigo: string;
  pageNumber: number;

  // Dados extraídos
  rawText: string; // Texto bruto da página
  numeroQuestao?: number; // Número da questão na prova
  enunciado: string;
  alternativas: string[]; // Array de alternativas
  respostaCorreta?: string; // A, B, C, D, E ou numérico
  tipoQuestao: "multipla_escolha" | "alternativa";
  temGabarito: boolean;

  // Metadados sugeridos
  materia?: string;
  assunto?: string;
  dificuldade?: "facil" | "medio" | "dificil";

  // Qualidade da extração
  confidence: number; // 0-100
  temImagem: boolean;
  imagemUrl?: string;
  imagemPublicId?: string;
  temFormula: boolean;

  // Controle de revisão
  status: "pending" | "approved" | "rejected";
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;

  // Referência à questão final (se aprovada)
  questionId?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const ExtractedQuestionSchema: Schema = new Schema(
  {
    pdfSourceId: {
      type: Schema.Types.ObjectId,
      ref: "PdfSource",
      required: true,
    },
    vestibularCodigo: { type: String, required: true },
    pageNumber: { type: Number, required: true },

    rawText: { type: String, required: false },
    numeroQuestao: { type: Number },
    enunciado: { type: String, required: true },
    alternativas: [{ type: String }],
    respostaCorreta: { type: String }, // Removido enum estrito para evitar quebras na extração
    tipoQuestao: {
      type: String,
      enum: ["multipla_escolha", "alternativa"],
      default: "multipla_escolha",
    },
    temGabarito: { type: Boolean, default: false },

    materia: { type: String },
    assunto: { type: String },
    dificuldade: { type: String, enum: ["facil", "medio", "dificil"] },

    confidence: { type: Number, required: true, min: 0, max: 100 },
    temImagem: { type: Boolean, default: false },
    imagemUrl: { type: String },
    imagemPublicId: { type: String },
    temFormula: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNotes: { type: String },

    questionId: { type: Schema.Types.ObjectId, ref: "Question" },
  },
  { timestamps: true }
);

// Índices para performance
ExtractedQuestionSchema.index({ status: 1, vestibularCodigo: 1 });
ExtractedQuestionSchema.index({ pdfSourceId: 1 });

export const ExtractedQuestion = mongoose.model<IExtractedQuestion>(
  "ExtractedQuestion",
  ExtractedQuestionSchema
);
