export interface RecursoVestibular {
  tipo: "provas" | "informacoes" | "notas_corte" | "concorrencia" | "listas";
  titulo: string;
  googleDriveUrl: string;
  descricao: string;
}

export interface InformacoesProva {
  data?: string;
  inscricoes?: {
    inicio: string;
    fim: string;
    status: "aberto" | "encerrado" | "em_breve";
  };
  taxa?: number;
  siteInscricao?: string;
}

export interface Vestibular {
  codigo: string;
  nome: string;
  nomeCompleto: string;
  sigla: string;
  logoUrl?: string;
  descricao: string;
  siteOficial: string;

  // Localização
  cidade: string;
  estado: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };

  // Próxima prova
  proximaProva?: InformacoesProva;

  // Recursos disponíveis
  recursos: RecursoVestibular[];
}

export interface ProcessoSeriado {
  codigo: string;
  nome: string;
  sigla: string;
  universidade: string;
  descricao: string;
  siteOficial: string;

  // Informações específicas
  fases: number;
  duracaoAnos: number;

  // Próxima prova
  proximaProva?: InformacoesProva;

  // Recursos
  recursos: RecursoVestibular[];
}
