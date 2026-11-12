import { Request, Response } from "express";
import { Faq, FaqCategoria } from "../models/Faq";
import { AppError } from "../errors/AppError";

const CATEGORIAS: FaqCategoria[] = ["escola", "aluno", "geral"];

/** Conteúdo inicial: substitui os arrays fixos que estavam na página. */
const PERGUNTAS_PADRAO = [
  {
    pergunta: "Como cadastro minha escola?",
    resposta:
      "Crie a conta em /register escolhendo o perfil Escola. A liberação dos planos escolares acontece após a confirmação do pagamento.",
    categoria: "escola" as FaqCategoria,
    ordem: 1,
  },
  {
    pergunta: "Como cadastro meus alunos?",
    resposta:
      "No painel da escola, vá em Alunos → Cadastrar. Cada aluno tem login próprio; hoje o cadastro é individual (importação em massa ainda não está disponível).",
    categoria: "escola" as FaqCategoria,
    ordem: 2,
  },
  {
    pergunta: "Posso criar simulados personalizados?",
    resposta:
      "Sim. Você escolhe vestibular, matéria, dificuldade e quantidade de questões; o sistema monta a prova com as questões aprovadas do banco.",
    categoria: "escola" as FaqCategoria,
    ordem: 3,
  },
  {
    pergunta: "Como acesso meus simulados?",
    resposta:
      "Depois do login, acesse Dashboard → Meus Simulados. Lá ficam os simulados gerados e o histórico do que você já finalizou.",
    categoria: "aluno" as FaqCategoria,
    ordem: 1,
  },
  {
    pergunta: "Esqueci minha senha, o que fazer?",
    resposta:
      "Na tela de login, clique em “Esqueci minha senha” e informe seu e-mail. O link de redefinição vale por 1 hora e só pode ser usado uma vez.",
    categoria: "aluno" as FaqCategoria,
    ordem: 2,
  },
  {
    pergunta: "Como vejo meu desempenho?",
    resposta:
      "A página Meu Desempenho mostra acerto geral, evolução dos últimos simulados e o percentual por matéria, com o ponto fraco em destaque.",
    categoria: "aluno" as FaqCategoria,
    ordem: 3,
  },
  {
    pergunta: "Como faço o pagamento?",
    resposta:
      "O checkout gera um PIX pelo Mercado Pago. Se o gateway recusar a cobrança, a tela mostra a chave PIX manual e o botão para enviar o comprovante pelo WhatsApp.",
    categoria: "geral" as FaqCategoria,
    ordem: 1,
  },
  {
    pergunta: "Preciso de assinatura para gerar simulado?",
    resposta:
      "Sim. Sem assinatura ativa o sistema mostra os planos e o caminho para pagar; a liberação é automática após a confirmação.",
    categoria: "geral" as FaqCategoria,
    ordem: 2,
  },
];

export class FaqController {
  /** Público: só publicados, na ordem definida. */
  static async publico(req: Request, res: Response) {
    try {
      const filtro: Record<string, unknown> = { publicado: true };
      const categoria = String(req.query.categoria ?? "");
      if (CATEGORIAS.includes(categoria as FaqCategoria)) {
        filtro.categoria = categoria;
      }
      const itens = await Faq.find(filtro).sort({ ordem: 1, criadoEm: 1 });
      res.json(itens);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async listarAdmin(_req: Request, res: Response) {
    try {
      const itens = await Faq.find().sort({ categoria: 1, ordem: 1 });
      res.json(itens);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async criar(req: Request, res: Response) {
    try {
      const item = await Faq.create(req.body);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async atualizar(req: Request, res: Response) {
    try {
      const item = await Faq.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!item) throw new AppError("Pergunta não encontrada", 404);
      res.json(item);
    } catch (error: any) {
      res.status(error.statusCode ?? 400).json({ error: error.message });
    }
  }

  static async remover(req: Request, res: Response) {
    try {
      const item = await Faq.findByIdAndDelete(req.params.id);
      if (!item) throw new AppError("Pergunta não encontrada", 404);
      res.status(204).end();
    } catch (error: any) {
      res.status(error.statusCode ?? 400).json({ error: error.message });
    }
  }

  /** Popula o conteúdo inicial só se a coleção estiver vazia. */
  static async seed(_req: Request, res: Response) {
    try {
      const existentes = await Faq.countDocuments();
      if (existentes > 0) {
        return res.json({ ok: true, criados: 0 });
      }
      const criados = await Faq.insertMany(
        PERGUNTAS_PADRAO.map((item) => ({ ...item, publicado: true })),
      );
      res.status(201).json({ ok: true, criados: criados.length });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
