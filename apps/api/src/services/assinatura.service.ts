import { Assinatura, IAssinatura } from "../models/Assinatura";
import { Aluno, User } from "../models/User";
import mongoose from "mongoose";

/** Duração de um ciclo pago (mensal). */
export const DIAS_CICLO = 30;

export interface RenovarParams {
  usuarioId: string;
  plano: string;
  origem?: "individual" | "escola";
  escolaId?: string;
  descontoPercentual?: number;
  /** Início do ciclo (default: agora). */
  agora?: Date;
}

export class AssinaturaService {
  /** Valor do ciclo com desconto aplicado (em reais, 2 casas). */
  static valorComDesconto(valor: number, descontoPercentual = 0): number {
    const fator = 1 - Math.min(Math.max(descontoPercentual, 0), 100) / 100;
    return Math.round(valor * fator * 100) / 100;
  }

  /**
   * Marca/renova a assinatura do usuário por um ciclo.
   * É chamado quando o PagBank confirma o pagamento (webhook).
   */
  static async renovar(params: RenovarParams): Promise<IAssinatura> {
    const agora = params.agora ?? new Date();
    const fim = new Date(agora.getTime() + DIAS_CICLO * 24 * 60 * 60 * 1000);

    const assinatura = await Assinatura.findOneAndUpdate(
      { usuario: new mongoose.Types.ObjectId(params.usuarioId) },
      {
        $set: {
          plano: params.plano,
          origem: params.origem ?? "individual",
          ...(params.escolaId
            ? { escolaId: new mongoose.Types.ObjectId(params.escolaId) }
            : {}),
          status: "ativa",
          cicloInicio: agora,
          cicloFim: fim,
          proximaCobrancaEm: fim,
          ...(params.descontoPercentual !== undefined
            ? { descontoPercentual: params.descontoPercentual }
            : {}),
        },
        $setOnInsert: { usuario: new mongoose.Types.ObjectId(params.usuarioId) },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return assinatura;
  }

  /** Assinatura própria ativa (ciclo não vencido). */
  static async assinaturaVigente(usuarioId: string, agora = new Date()) {
    return await Assinatura.findOne({
      usuario: new mongoose.Types.ObjectId(usuarioId),
      status: "ativa",
      cicloFim: { $gte: agora },
    });
  }

  /**
   * Aluno vinculado a escola cujo ciclo está ativo não é cobrado — quem paga é
   * a escola. Sem vínculo (ou escola vencida), o aluno é cobrado normalmente.
   */
  static async escolaPagante(usuarioId: string, agora = new Date()) {
    const aluno = await Aluno.findById(usuarioId).select("escolaId");
    const escolaId = (aluno as any)?.escolaId;
    if (!escolaId) return null;

    const assinaturaEscola = await Assinatura.findOne({
      usuario: escolaId,
      status: "ativa",
      cicloFim: { $gte: agora },
    });
    if (!assinaturaEscola) return null;

    const escola = await User.findById(escolaId).select("name nomeEscola email");
    return { escolaId: String(escolaId), escola };
  }

  /**
   * Desconto (%) que a escola do aluno concede para ele assinar sozinho.
   * Só vale quando a escola não está cobrindo o acesso (nesse caso nem há
   * cobrança — ver `escolaPagante`).
   */
  static async descontoDoAluno(usuarioId: string): Promise<number> {
    const aluno = await Aluno.findById(usuarioId).select("escolaId");
    const escolaId = (aluno as any)?.escolaId;
    if (!escolaId) return 0;

    const escola = await User.findById(escolaId).select(
      "descontoAlunosPercentual",
    );
    const desconto = Number((escola as any)?.descontoAlunosPercentual ?? 0);
    return Number.isFinite(desconto) ? Math.min(Math.max(desconto, 0), 100) : 0;
  }

  /** O usuário pode usar o sistema? (assinatura própria ou escola pagando) */
  static async acessoLiberado(
    usuarioId: string,
    agora = new Date(),
  ): Promise<{ liberado: boolean; motivo: string }> {
    const propria = await this.assinaturaVigente(usuarioId, agora);
    if (propria) {
      return { liberado: true, motivo: "assinatura_ativa" };
    }

    const escola = await this.escolaPagante(usuarioId, agora);
    if (escola) {
      return { liberado: true, motivo: `escola:${escola.escolaId}` };
    }

    const existe = await Assinatura.findOne({
      usuario: new mongoose.Types.ObjectId(usuarioId),
    });
    if (!existe) return { liberado: false, motivo: "sem_assinatura" };
    if (existe.status === "ativa") return { liberado: false, motivo: "vencida" };
    return { liberado: false, motivo: existe.status };
  }

  /** Marca como atrasada (cron/vencimento). */
  static async marcarAtrasadas(agora = new Date()) {
    const resultado = await Assinatura.updateMany(
      { status: "ativa", cicloFim: { $lt: agora } },
      { $set: { status: "atrasada" } },
    );
    return resultado.modifiedCount ?? 0;
  }
}
