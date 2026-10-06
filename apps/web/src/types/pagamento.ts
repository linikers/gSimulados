export interface IPlano {
  codigo: string;
  nome: string;
  preco: number;
  alunos: number;
  descricao: string;
  publico: "individual" | "escola";
}

export interface IPixPublico {
  configurado: boolean;
  chave?: string;
  nomeBeneficiario?: string;
  cidade?: string;
  instrucoes?: string;
}

export type PagamentoStatus = "pendente" | "pago" | "cancelado" | "expirado";

export interface IPagamento {
  _id: string;
  plano: string;
  valor: number;
  metodo: "pix";
  status: PagamentoStatus;
  referencia: string;
  criadoEm: string;
  confirmadoEm?: string;
  usuario?: { _id: string; name: string; email: string; role: string };
}

export interface ICheckoutResponse {
  pagamento: IPagamento;
  pix: {
    chave: string;
    nomeBeneficiario: string;
    cidade: string;
    instrucoes: string;
  };
}

export interface IPixConfig {
  _id?: string;
  chave: string;
  nomeBeneficiario: string;
  cidade: string;
  instrucoes: string;
  ativo: boolean;
}
