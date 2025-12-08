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
  nomeEscola?: string;
  endereco?: string;
  telefone?: string;
  logo?: string;
}

export interface IAluno extends IUser {
  escolaId?: string;
  matricula?: string;
  turmaId?: string;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}
