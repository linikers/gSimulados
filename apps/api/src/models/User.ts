import mongoose, { Schema, Document } from "mongoose";
import { IUser, IEscola, IAluno, UserRole } from "@gsimulados/shared";

// Extend Mongoose Document with Shared Interface
export type { IUser };
export interface IUserDocument extends Omit<IUser, "_id">, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "escola", "aluno"],
      required: true,
      default: "aluno",
    },
  },
  { discriminatorKey: "role", timestamps: true }
);

export const User = mongoose.model<IUserDocument>("User", UserSchema);

// --- Discriminators (Sub-perfis) ---

// Schema da Escola
const EscolaSchema = new Schema({
  cnpj: String,
  nomeEscola: String,
  endereco: String,
  telefone: String,
  logo: String,
});

// Schema do Aluno
const AlunoSchema = new Schema({
  matricula: String,
  turmaId: { type: Schema.Types.ObjectId, ref: "Turma" },
  escolaId: { type: Schema.Types.ObjectId, ref: "User" },
});

export const Escola = User.discriminator("escola", EscolaSchema);
export const Aluno = User.discriminator("aluno", AlunoSchema);
