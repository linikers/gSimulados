import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "admin" | "escola" | "aluno";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "escola", "aluno"], required: true },
  },
  { discriminatorKey: "role", timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);

// Discriminators
const EscolaSchema = new Schema({
  cnpj: String,
  endereco: String,
  telefone: String,
});

const AlunoSchema = new Schema({
  matricula: String,
  turmaId: { type: Schema.Types.ObjectId, ref: "Turma" },
  escolaId: { type: Schema.Types.ObjectId, ref: "User" }, // Escola is a User
});

export const Escola = User.discriminator("escola", EscolaSchema);
export const Aluno = User.discriminator("aluno", AlunoSchema);
