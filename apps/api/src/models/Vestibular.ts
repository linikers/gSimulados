import mongoose, { Schema, Document } from "mongoose";

export interface IVestibular extends Document {
  codigo: string; // 'uem', 'uel', 'enem', etc
  nome: string;
  nomeCompleto: string;
  logoUrl?: string;
  descricao: string;
  siteOficial: string;

  // Localização
  cidade?: string;
  estado?: string;

  // Próxima prova
  proximaProva?: {
    data: Date;
    inscricoes: {
      inicio: Date;
      fim: Date;
      status: "aberto" | "encerrado" | "em_breve";
    };
    taxa: number;
    siteInscricao: string;
  };

  // Google Drive folders (para sync futuro)
  googleDriveFolders?: {
    provas?: string;
    informacoes?: string;
    notasCorte?: string;
  };

  ativo: boolean;
  ordem: number; // Para ordenação na listagem
  createdAt: Date;
  updatedAt: Date;
}

const VestibularSchema: Schema = new Schema(
  {
    codigo: { type: String, required: true, unique: true },
    nome: { type: String, required: true },
    nomeCompleto: { type: String, required: true },
    logoUrl: { type: String },
    descricao: { type: String, required: true },
    siteOficial: { type: String, required: true },
    cidade: { type: String },
    estado: { type: String },
    proximaProva: {
      data: Date,
      inscricoes: {
        inicio: Date,
        fim: Date,
        status: { type: String, enum: ["aberto", "encerrado", "em_breve"] },
      },
      taxa: Number,
      siteInscricao: String,
    },
    googleDriveFolders: {
      provas: String,
      informacoes: String,
      notasCorte: String,
    },
    ativo: { type: Boolean, default: true },
    ordem: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Vestibular = mongoose.model<IVestibular>(
  "Vestibular",
  VestibularSchema
);
