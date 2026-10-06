import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  enunciado: string;
  alternativas: string[]; // ["A) ...", "B) ..."]
  respostaCorreta: string; // "A", "B", "C", "D", "E" ou número (somatória)
  materia: string;
  assunto: string;
  dificuldade: "facil" | "medio" | "dificil";
  origem: {
    vestibular: string;
    ano: number;
    prova?: string; // e.g., "1ª Fase"
  };
  tags: string[];
  temImagem?: boolean;
  imagemUrl?: string;
  /** Região da figura dentro da imagem da página, em fração (0 a 1). */
  imagemBbox?: { x: number; y: number; w: number; h: number };
  imagemDescricao?: string;
  imagemLargura?: number;
  imagemAltura?: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

const QuestionSchema: Schema = new Schema(
  {
    enunciado: { type: String, required: true },
    alternativas: {
      type: [String],
      required: true,
      // Removido validação fixa de 5 para suportar somatórias
    },
    respostaCorreta: {
      type: String,
      required: true,
      // Removido enum para aceitar números (somatória)
    },
    materia: { type: String, required: true },
    assunto: { type: String, required: true },
    dificuldade: {
      type: String,
      enum: ["facil", "medio", "dificil"],
      default: "medio",
    },
    origem: {
      vestibular: { type: String, required: true },
      ano: { type: Number, required: true },
      prova: { type: String },
    },
    tags: { type: [String], default: [] },
    temImagem: { type: Boolean, default: false },
    imagemUrl: { type: String },
    imagemBbox: { x: Number, y: Number, w: Number, h: Number },
    imagemDescricao: { type: String },
    imagemLargura: { type: Number },
    imagemAltura: { type: Number },
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } }
);

export const Question = mongoose.model<IQuestion>("Question", QuestionSchema);
