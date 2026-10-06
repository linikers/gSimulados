import mongoose, { Schema, Document } from "mongoose";

export type PagamentoStatus = "pendente" | "pago" | "cancelado" | "expirado";

export interface IPagamento extends Document {
  usuario: mongoose.Types.ObjectId;
  plano: string;
  valor: number;
  metodo: "pix";
  status: PagamentoStatus;
  referencia: string;
  confirmadoPor?: mongoose.Types.ObjectId;
  confirmadoEm?: Date;
  expiraEm?: Date;
  criadoEm: Date;
  atualizadoEm: Date;
}

const PagamentoSchema: Schema = new Schema(
  {
    usuario: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plano: { type: String, required: true },
    valor: { type: Number, required: true },
    metodo: { type: String, enum: ["pix"], default: "pix" },
    status: {
      type: String,
      enum: ["pendente", "pago", "cancelado", "expirado"],
      default: "pendente",
    },
    referencia: { type: String, required: true, unique: true },
    confirmadoPor: { type: Schema.Types.ObjectId, ref: "User" },
    confirmadoEm: { type: Date },
    expiraEm: { type: Date },
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } },
);

export const Pagamento = mongoose.model<IPagamento>("Pagamento", PagamentoSchema);
