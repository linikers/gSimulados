import mongoose, { Schema, Document } from "mongoose";

export type PagamentoStatus =
  | "pendente"
  | "pago"
  | "recusado"
  | "cancelado"
  | "expirado";

export type PagamentoMetodo = "pix" | "boleto" | "cartao";

export interface IPagamento extends Document {
  usuario: mongoose.Types.ObjectId;
  plano: string;
  /** Em reais (19.9). No envio ao PagBank vira centavos. */
  valor: number;
  metodo: PagamentoMetodo;
  status: PagamentoStatus;
  /** Nosso identificador (GS-XXXXXX ou UUID) — vai como `reference_id`. */
  referencia: string;
  /** `manual` = PIX conferido à mão pelo admin (fluxo antigo, ainda válido). */
  gateway?: "pagbank" | "manual";
  pagbankPedidoId?: string;
  pagbankChargeId?: string;
  /** PIX copia-e-cola devolvido pelo PagBank. */
  qrCodeTexto?: string;
  qrCodePngUrl?: string;
  boletoBarcode?: string;
  boletoPdfUrl?: string;
  pagoEm?: Date;
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
    metodo: {
      type: String,
      enum: ["pix", "boleto", "cartao"],
      default: "pix",
    },
    status: {
      type: String,
      enum: ["pendente", "pago", "recusado", "cancelado", "expirado"],
      default: "pendente",
      index: true,
    },
    referencia: { type: String, required: true, unique: true },
    gateway: { type: String, enum: ["pagbank", "manual"] },
    pagbankPedidoId: { type: String, index: true },
    pagbankChargeId: { type: String, index: true },
    qrCodeTexto: { type: String },
    qrCodePngUrl: { type: String },
    boletoBarcode: { type: String },
    boletoPdfUrl: { type: String },
    pagoEm: { type: Date },
    confirmadoPor: { type: Schema.Types.ObjectId, ref: "User" },
    confirmadoEm: { type: Date },
    expiraEm: { type: Date },
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } },
);

export const Pagamento = mongoose.model<IPagamento>(
  "Pagamento",
  PagamentoSchema,
);
