import { Request, Response } from "express";
import { PixConfig } from "../models/PixConfig";
import { Pagamento } from "../models/Pagamento";
import { User } from "../models/User";
import { PLANOS, getPlano } from "../config/planos";

/** Gera um código curto de referência para o aluno informar no PIX. */
function gerarReferencia(): string {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return `GS-${codigo}`;
}

export class PagamentosController {
  /** Catálogo de planos (público). */
  static async listarPlanos(_req: Request, res: Response) {
    res.json(PLANOS);
  }

  /** Dados do PIX para exibir ao aluno (não expõe nada sensível). */
  static async getPixPublico(_req: Request, res: Response) {
    const config = await PixConfig.findOne();
    if (!config || !config.ativo) {
      return res.json({ configurado: false });
    }
    res.json({
      configurado: true,
      chave: config.chave,
      nomeBeneficiario: config.nomeBeneficiario,
      cidade: config.cidade,
      instrucoes: config.instrucoes,
    });
  }

  /** (Admin) Lê a configuração completa do PIX. */
  static async getPixConfig(_req: Request, res: Response) {
    const config = await PixConfig.findOne();
    res.json(config ?? null);
  }

  /** (Admin) Salva a configuração do PIX (manual, sem gateway). */
  static async salvarPixConfig(req: Request, res: Response) {
    try {
      const { chave, nomeBeneficiario, cidade, instrucoes, ativo } = req.body;

      if (!chave || !String(chave).trim()) {
        return res.status(400).json({ error: "A chave PIX é obrigatória" });
      }

      let config = await PixConfig.findOne();
      if (!config) {
        config = new PixConfig();
      }

      config.chave = String(chave).trim();
      config.nomeBeneficiario = nomeBeneficiario ?? "";
      config.cidade = cidade ?? "";
      config.instrucoes = instrucoes ?? "";
      config.ativo = Boolean(ativo);
      config.atualizadoPor = req.userId as unknown as typeof config.atualizadoPor;

      await config.save();
      res.json(config);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /** (Aluno) Cria um pedido de assinatura e devolve os dados do PIX. */
  static async checkout(req: Request, res: Response) {
    try {
      const { plano } = req.body;
      const planoEscolhido = getPlano(plano);

      if (!planoEscolhido) {
        return res.status(400).json({ error: "Plano inválido" });
      }
      if (planoEscolhido.preco <= 0) {
        return res
          .status(400)
          .json({ error: "Este plano é gratuito e não precisa de pagamento" });
      }

      const config = await PixConfig.findOne();
      if (!config || !config.ativo) {
        return res.status(503).json({
          error:
            "Pagamento via PIX ainda não configurado. Fale com o suporte para assinar.",
        });
      }

      const pagamento = await Pagamento.create({
        usuario: req.userId,
        plano: planoEscolhido.codigo,
        valor: planoEscolhido.preco,
        metodo: "pix",
        status: "pendente",
        referencia: gerarReferencia(),
        expiraEm: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      });

      res.status(201).json({
        pagamento,
        pix: {
          chave: config.chave,
          nomeBeneficiario: config.nomeBeneficiario,
          cidade: config.cidade,
          instrucoes: config.instrucoes,
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /** (Aluno) Lista os próprios pedidos. */
  static async meusPagamentos(req: Request, res: Response) {
    const pagamentos = await Pagamento.find({ usuario: req.userId }).sort({
      criadoEm: -1,
    });
    res.json(pagamentos);
  }

  /** (Admin) Lista todos os pedidos. */
  static async listarTodos(_req: Request, res: Response) {
    const pagamentos = await Pagamento.find()
      .populate("usuario", "name email role")
      .sort({ criadoEm: -1 });
    res.json(pagamentos);
  }

  /** (Admin) Confirma manualmente o recebimento e ativa o plano. */
  static async confirmar(req: Request, res: Response) {
    try {
      const pagamento = await Pagamento.findById(req.params.id);
      if (!pagamento) {
        return res.status(404).json({ error: "Pagamento não encontrado" });
      }
      if (pagamento.status === "pago") {
        return res.json(pagamento);
      }

      pagamento.status = "pago";
      pagamento.confirmadoPor = req.userId as unknown as typeof pagamento.confirmadoPor;
      pagamento.confirmadoEm = new Date();
      await pagamento.save();

      const planoExpiraEm = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await User.findByIdAndUpdate(pagamento.usuario, {
        plano: pagamento.plano,
        planoExpiraEm,
      });

      res.json(pagamento);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
