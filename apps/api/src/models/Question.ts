import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  enunciado: string;
  alternativas: string[]; // ["A) ...", "B) ..."]
  respostaCorreta: string; // "A", "B", "C", "D", "E"
  materia: string;
  assunto: string;
  dificuldade: "facil" | "medio" | "dificil";
  origem: {
    vestibular: string;
    ano: number;
    prova?: string; // e.g., "1ª Fase"
  };
  tags: string[];
  criadoEm: Date;
  atualizadoEm: Date;
}

const QuestionSchema: Schema = new Schema(
  {
    enunciado: { type: String, required: true },
    alternativas: {
      type: [String],
      required: true,
      validate: [arrayLimit, "{PATH} must have 5 options"],
    },
    respostaCorreta: {
      type: String,
      required: true,
      enum: ["A", "B", "C", "D", "E"],
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
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } }
);

function arrayLimit(val: string[]) {
  return val.length === 5;
}

export const Question = mongoose.model<IQuestion>("Question", QuestionSchema);
