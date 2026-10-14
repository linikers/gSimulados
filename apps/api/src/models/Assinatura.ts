import mongoose, { Schema, Document } from "mongoose";

/**
 * Assinatura do usuário (aluno ou escola).
 *
 * O PagBank não faz recorrência para conta PF, então cada ciclo é uma cobrança
 * nova criada por nós (Orders API) — esta coleção guarda até quando o acesso
 * está pago.
 */
export type AssinaturaStatus = "pendente" | "ativa" | "atrasada" | "cancelada";

export interface IAssinatura extends Document {
  usuario: mongoose.Types.ObjectId;
  plano: string;
  /** `individual` = aluno pagante · `escola` = escola que paga pelos alunos. */
  origem: "individual" | "escola";
  /** Preenchido quando o aluno está coberto por uma escola. */
  escolaId?: mongoose.Types.ObjectId;
  status: AssinaturaStatus;
  cicloInicio?: Date;
  cicloFim?: Date;
  proximaCobrancaEm?: Date;
  descontoPercentual: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

const AssinaturaSchema: Schema = new Schema(
  {
    usuario: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plano: { type: String, required: true },
    origem: {
      type: String,
      enum: ["individual", "escola"],
      default: "individual",
    },
    escolaId: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pendente", "ativa", "atrasada", "cancelada"],
      default: "pendente",
      index: true,
    },
    cicloInicio: { type: Date },
    cicloFim: { type: Date, index: true },
    proximaCobrancaEm: { type: Date },
    descontoPercentual: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } },
);

export const Assinatura = mongoose.model<IAssinatura>(
  "Assinatura",
  AssinaturaSchema,
);
