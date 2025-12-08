import mongoose, { Schema, Document } from "mongoose";
import { IEscola } from "@gsimulados/shared";

export interface IEscolaDocument extends IEscola, Document {}

const EscolaSchema = new Schema<IEscolaDocument>(
  {
    cnpj: { type: String },
    endereco: { type: String },
    telefone: { type: String },
  },
  { discriminatorKey: "role" }
);

// Setup discriminator if needed or simple referencing.
// For simplicity in this stack, we might use separate collections or discriminators on User.
// For now, let's keep it simple: "Escola" might be a separate profile linked to User,
// OR we use User with discriminator.
// Given strict RBAC, defining profiles as separate schemas linked by userId is cleaner
// but discriminators are widely used in Mongoose.
// Let's use Discriminators on the User model for better single-collection querying.
