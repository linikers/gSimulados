import mongoose, { Schema, Document } from "mongoose";

export interface IPdfSource extends Document {
  driveConfigId: mongoose.Types.ObjectId;
  vestibularCodigo: string;
  driveFileId: string; // ID do arquivo no Google Drive
  fileName: string;
  fileSize: number; // em bytes
  mimeType: string;
  webViewLink: string; // Link para visualizar no Drive
  uploadDate: Date; // Data de upload no Drive
  status: "pending" | "processing" | "completed" | "error";
  totalPaginas?: number;
  questoesExtraidas: number;
  errorMessage?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PdfSourceSchema: Schema = new Schema(
  {
    driveConfigId: {
      type: Schema.Types.ObjectId,
      ref: "DriveConfig",
      required: true,
    },
    vestibularCodigo: { type: String, required: true },
    driveFileId: { type: String, required: true, unique: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, default: "application/pdf" },
    webViewLink: { type: String, required: true },
    uploadDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "error"],
      default: "pending",
    },
    totalPaginas: { type: Number },
    questoesExtraidas: { type: Number, default: 0 },
    errorMessage: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

export const PdfSource = mongoose.model<IPdfSource>(
  "PdfSource",
  PdfSourceSchema
);
