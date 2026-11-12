import mongoose, { Schema, Document } from "mongoose";

export type FaqCategoria = "escola" | "aluno" | "geral";

export interface IFaq extends Document {
  pergunta: string;
  resposta: string;
  categoria: FaqCategoria;
  ordem: number;
  publicado: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

const FaqSchema: Schema = new Schema(
  {
    pergunta: { type: String, required: true, trim: true },
    resposta: { type: String, required: true, trim: true },
    categoria: {
      type: String,
      enum: ["escola", "aluno", "geral"],
      default: "geral",
      index: true,
    },
    ordem: { type: Number, default: 0 },
    publicado: { type: Boolean, default: true, index: true },
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } },
);

export const Faq = mongoose.model<IFaq>("Faq", FaqSchema);
