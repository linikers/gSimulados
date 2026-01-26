import mongoose, { Schema, Document } from "mongoose";

export interface ISimulado extends Document {
  nome: string;
  questoes: mongoose.Types.ObjectId[];
  materia?: string;
  dificuldade: "facil" | "medio" | "dificil" | "misto";
  quantidadeQuestoes: number;
  usuario: mongoose.Types.ObjectId;
  tentativas: {
    aluno: mongoose.Types.ObjectId;
    respostas: {
      questaoId: mongoose.Types.ObjectId;
      respostaSelecionada: string;
      correta: boolean;
    }[];
    notaSoma?: number;
    finalizadoEm: Date;
  }[];
  criadoEm: Date;
  atualizadoEm: Date;
}

const SimuladoSchema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    questoes: [
      { type: Schema.Types.ObjectId, ref: "Question", required: true },
    ],
    materia: { type: String },
    dificuldade: {
      type: String,
      enum: ["facil", "medio", "dificil", "misto"],
      default: "misto",
    },
    quantidadeQuestoes: { type: Number, required: true },
    usuario: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tentativas: [
      {
        aluno: { type: Schema.Types.ObjectId, ref: "User" },
        respostas: [
          {
            questaoId: { type: Schema.Types.ObjectId, ref: "Question" },
            respostaSelecionada: { type: String },
            correta: { type: Boolean },
          },
        ],
        notaSoma: { type: Number },
        finalizadoEm: { type: Date },
      },
    ],
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } },
);

export const Simulado = mongoose.model<ISimulado>("Simulado", SimuladoSchema);
