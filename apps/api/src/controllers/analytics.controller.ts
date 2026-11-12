import { Request, Response } from "express";
import { User } from "../models/User";
import { Question } from "../models/Question";
import { ExtractedQuestion } from "../models/ExtractedQuestion";
import { PdfSource } from "../models/PdfSource";
import { Simulado } from "../models/Simulado";
import { Assinatura } from "../models/Assinatura";
import { Pagamento } from "../models/Pagamento";

const TRINTA_DIAS = 30 * 24 * 60 * 60 * 1000;

/**
 * Resumo do funil para o admin: quem usa, quanto conteúdo existe, o que está
 * parado na extração e quanto entrou de dinheiro.
 */
export class AnalyticsController {
  static async resumo(_req: Request, res: Response) {
    try {
      const desde = new Date(Date.now() - TRINTA_DIAS);

      const [
        alunos,
        escolas,
        questoes,
        porVestibular,
        extracaoPendente,
        extracaoAprovada,
        extracaoRejeitada,
        pdfsOk,
        pdfsErro,
        simulados,
        tentativasAgg,
        simulados30,
        assinaturasAtivas,
        receitaAgg,
        receita30Agg,
        pagos,
        pendentes,
      ] = await Promise.all([
        User.countDocuments({ role: "aluno" }),
        User.countDocuments({ role: "escola" }),
        Question.countDocuments(),
        Question.aggregate([
          { $group: { _id: "$origem.vestibular", total: { $sum: 1 } } },
          { $sort: { total: -1 } },
          { $limit: 8 },
        ]),
        ExtractedQuestion.countDocuments({ status: "pending" }),
        ExtractedQuestion.countDocuments({ status: "approved" }),
        ExtractedQuestion.countDocuments({ status: "rejected" }),
        PdfSource.countDocuments({ status: "completed" }),
        PdfSource.countDocuments({ status: "error" }),
        Simulado.countDocuments(),
        Simulado.aggregate([
          {
            $project: {
              n: { $size: { $ifNull: ["$tentativas", []] } },
            },
          },
          { $group: { _id: null, total: { $sum: "$n" } } },
        ]),
        Simulado.countDocuments({ criadoEm: { $gte: desde } }),
        Assinatura.countDocuments({ status: "ativa" }),
        Pagamento.aggregate([
          { $match: { status: "pago" } },
          { $group: { _id: null, total: { $sum: "$valor" } } },
        ]),
        Pagamento.aggregate([
          { $match: { status: "pago", pagoEm: { $gte: desde } } },
          { $group: { _id: null, total: { $sum: "$valor" } } },
        ]),
        Pagamento.countDocuments({ status: "pago" }),
        Pagamento.countDocuments({ status: "pendente" }),
      ]);

      res.json({
        usuarios: { alunos, escolas },
        questoes: {
          total: questoes,
          porVestibular: porVestibular.map((item) => ({
            vestibular: item._id || "outros",
            total: item.total,
          })),
        },
        extracao: {
          pendentes: extracaoPendente,
          aprovadas: extracaoAprovada,
          rejeitadas: extracaoRejeitada,
          pdfsProcessados: pdfsOk,
          pdfsComErro: pdfsErro,
        },
        simulados: {
          total: simulados,
          tentativas: tentativasAgg[0]?.total ?? 0,
          ultimos30: simulados30,
        },
        assinaturasAtivas,
        receita: {
          total: receitaAgg[0]?.total ?? 0,
          ultimos30: receita30Agg[0]?.total ?? 0,
          pagamentosConfirmados: pagos,
          pendentes,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
