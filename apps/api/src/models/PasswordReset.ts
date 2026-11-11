import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPasswordReset extends Document {
  usuario: Types.ObjectId;
  /** SHA-256 do token enviado por e-mail; o valor cru nunca fica no banco. */
  tokenHash: string;
  expiraEm: Date;
  usadoEm?: Date;
  criadoEm: Date;
  atualizadoEm: Date;
}

const PasswordResetSchema: Schema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    expiraEm: { type: Date, required: true },
    usadoEm: { type: Date },
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } },
);

// Limpa tokens vencidos sozinho; a checagem na hora do uso continua valendo.
PasswordResetSchema.index({ expiraEm: 1 }, { expireAfterSeconds: 0 });

export const PasswordReset = mongoose.model<IPasswordReset>(
  "PasswordReset",
  PasswordResetSchema,
);
