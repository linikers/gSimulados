export type UserRole = "admin" | "escola" | "aluno";

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEscola extends IUser {
  cnpj?: string;
  endereco?: string;
  telefone?: string;
}

export interface IAluno extends IUser {
  escolaId?: string;
  matricula?: string;
  turmaId?: string;
}
