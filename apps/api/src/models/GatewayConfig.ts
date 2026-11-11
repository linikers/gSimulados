import mongoose, { Schema, Document, Types } from "mongoose";

export type Gateway = "mercadopago" | "pagbank";

export interface IGatewayConfig extends Document {
  gateway: Gateway;
  /** JSON das credenciais cifrado com AES-256-GCM. Nunca retornar ao cliente. */
  credenciaisCifradas: string;
  ativo: boolean;
  atualizadoPor?: Types.ObjectId;
  criadoEm: Date;
  atualizadoEm: Date;
}

const GatewayConfigSchema: Schema = new Schema(
  {
    gateway: {
      type: String,
      enum: ["mercadopago", "pagbank"],
      required: true,
    },
    credenciaisCifradas: { type: String, required: true },
    ativo: { type: Boolean, default: true },
    atualizadoPor: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } },
);

GatewayConfigSchema.index({ gateway: 1 }, { unique: true });

export const GatewayConfig = mongoose.model<IGatewayConfig>(
  "GatewayConfig",
  GatewayConfigSchema,
);
