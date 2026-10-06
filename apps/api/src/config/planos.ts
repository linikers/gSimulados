export interface Plano {
  codigo: string;
  nome: string;
  preco: number;
  alunos: number;
  descricao: string;
  publico: "individual" | "escola";
}

/**
 * Catálogo de planos (fonte da verdade no servidor).
 * Valores conforme PIT-INVESTIMENTO-v2.
 */
export const PLANOS: Plano[] = [
  {
    codigo: "free",
    nome: "Free",
    preco: 0,
    alunos: 1,
    descricao: "Até 3 simulados por mês",
    publico: "individual",
  },
  {
    codigo: "individual",
    nome: "Individual",
    preco: 19.9,
    alunos: 1,
    descricao: "Simulados ilimitados para 1 aluno",
    publico: "individual",
  },
  {
    codigo: "escola_small",
    nome: "Escola Small",
    preco: 497,
    alunos: 100,
    descricao: "Até 100 alunos",
    publico: "escola",
  },
  {
    codigo: "escola_medium",
    nome: "Escola Medium",
    preco: 1497,
    alunos: 500,
    descricao: "Até 500 alunos",
    publico: "escola",
  },
  {
    codigo: "escola_large",
    nome: "Escola Large",
    preco: 3997,
    alunos: 2000,
    descricao: "Até 2.000 alunos",
    publico: "escola",
  },
];

export function getPlano(codigo: string): Plano | undefined {
  return PLANOS.find((p) => p.codigo === codigo);
}
