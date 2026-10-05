import mongoose, { Schema, Document } from "mongoose";

/**
 * Configuração do recebimento via PIX.
 * Documento único (singleton) — inicialmente preenchido de forma manual
 * pelo administrador, sem integração com gateway.
 */
export interface IPixConfig extends Document {
  chave: string;
  nomeBeneficiario: string;
  cidade: string;
  instrucoes: string;
  ativo: boolean;
  atualizadoPor?: mongoose.Types.ObjectId;
  criadoEm: Date;
  atualizadoEm: Date;
}

const PixConfigSchema: Schema = new Schema(
  {
    chave: { type: String, default: "" },
    nomeBeneficiario: { type: String, default: "" },
    cidade: { type: String, default: "" },
    instrucoes: { type: String, default: "" },
    ativo: { type: Boolean, default: false },
    atualizadoPor: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } },
);

export const PixConfig = mongoose.model<IPixConfig>("PixConfig", PixConfigSchema);
