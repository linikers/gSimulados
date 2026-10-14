import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "@gsimulados/shared";

// Extend Mongoose Document with Shared Interface
export type { IUser };
export interface IUserDocument extends Omit<IUser, "_id">, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    role: {
      type: String,
      enum: ["admin", "escola", "aluno"],
      required: true,
      default: "aluno",
    },
    plano: { type: String, default: "free" },
    planoExpiraEm: { type: Date },
    /** CPF (11) ou CNPJ (14), só dígitos — exigido pelo PagBank na cobrança. */
    taxId: { type: String },
    /** Endereço do pagador (reaproveitado no boleto). */
    enderecoCobranca: { type: Schema.Types.Mixed },
  },
  { discriminatorKey: "role", timestamps: true },
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
  /**
   * Desconto que a escola dá para os alunos dela assinarem sozinhos (%). Vale
   * só quando a escola NÃO está com o ciclo ativo — se estiver, o aluno é
   * coberto pela escola e nem é cobrado.
   */
  descontoAlunosPercentual: { type: Number, default: 0, min: 0, max: 100 },
});

// Schema do Aluno
const AlunoSchema = new Schema({
  matricula: String,
  turmaId: { type: Schema.Types.ObjectId, ref: "Turma" },
  escolaId: { type: Schema.Types.ObjectId, ref: "User" },
});

// Schema do Admin (necessário para o discriminatorKey "role")
const AdminSchema = new Schema({});

export const Escola = User.discriminator("escola", EscolaSchema);
export const Aluno = User.discriminator("aluno", AlunoSchema);
export const Admin = User.discriminator("admin", AdminSchema);
