import mongoose, { Schema, Document } from "mongoose";

export interface IDriveConfig extends Document {
  vestibularCodigo: string; // Referência ao vestibular
  googleDriveFolderId: string; // ID da pasta no Google Drive
  folderName: string;
  folderUrl: string; // URL completa da pasta
  lastSync: Date;
  totalPdfs: number;
  totalQuestoesExtraidas: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DriveConfigSchema: Schema = new Schema(
  {
    vestibularCodigo: { type: String, required: true, unique: true },
    googleDriveFolderId: { type: String, required: true },
    folderName: { type: String, required: true },
    folderUrl: { type: String, required: true },
    lastSync: { type: Date },
    totalPdfs: { type: Number, default: 0 },
    totalQuestoesExtraidas: { type: Number, default: 0 },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DriveConfig = mongoose.model<IDriveConfig>(
  "DriveConfig",
  DriveConfigSchema
);
