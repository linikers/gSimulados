import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRefreshToken extends Document {
  usuario: Types.ObjectId;
  /** SHA-256 do token cru — o valor que vale nunca fica no banco. */
  tokenHash: string;
  expiraEm: Date;
  revogadoEm?: Date;
  userAgent?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

const RefreshTokenSchema: Schema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    expiraEm: { type: Date, required: true },
    revogadoEm: { type: Date },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } },
);

// Limpa sozinho o que já expirou (não substitui a checagem na rotação).
RefreshTokenSchema.index({ expiraEm: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model<IRefreshToken>(
  "RefreshToken",
  RefreshTokenSchema,
);
