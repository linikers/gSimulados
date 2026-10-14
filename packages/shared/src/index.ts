export * from "./types/aluno";

export type UserRole = "admin" | "escola" | "aluno";

/** Endereço do pagador — exigido pelo boleto (PagBank). */
export interface IEnderecoCobranca {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  /** UF, ex.: "PR". */
  uf: string;
}

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  avatar?: string;
  plano?: string;
  planoExpiraEm?: Date;
  /** CPF (11) ou CNPJ (14), só dígitos — exigido na cobrança (PagBank). */
  taxId?: string;
  /** Guardado para reaproveitar no próximo boleto. */
  enderecoCobranca?: IEnderecoCobranca;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEscola extends IUser {
  cnpj?: string;
  nomeEscola?: string;
  endereco?: string;
  telefone?: string;
  logo?: string;
  /** Desconto (%) para os alunos da escola assinarem sozinhos. */
  descontoAlunosPercentual?: number;
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
