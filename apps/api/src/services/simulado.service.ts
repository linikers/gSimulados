import { Question } from "../models/Question";
import { Simulado } from "../models/Simulado";
import { gerarConteudoGemini } from "./gemini/gemini-client.service";
import mongoose from "mongoose";

export type Dificuldade = "facil" | "medio" | "dificil" | "misto";

export const DIFICULDADES: Dificuldade[] = [
  "facil",
  "medio",
  "dificil",
  "misto",
];

/** Teto do pool mandado para a IA (custo de tokens por simulado gerado). */
export const POOL_MAXIMO = 300;

function embaralhar<T>(lista: T[]): T[] {
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

export class SimuladoService {
  static async generate(params: {
    nome: string;
    materia?: string;
    vestibular?: string;
    dificuldade: Dificuldade;
    quantidade: number;
    usuarioId: string;
  }) {
    const { nome, materia, vestibular, dificuldade, quantidade, usuarioId } =
      params;

    const filtro: Record<string, unknown> = {};
    if (materia) filtro.materia = materia;
    if (vestibular) filtro["origem.vestibular"] = String(vestibular).toLowerCase();
    if (dificuldade !== "misto") filtro.dificuldade = dificuldade;

    // $sample é o que faz cada geração trazer uma prova diferente: com
    // .find().limit() o Mongo devolve sempre as MESMAS primeiras questões do
    // filtro (na prática todo aluno recebia a mesma prova, e as questões com
    // figura nunca entravam, por estarem mais para o fim da coleção).
    const poolSize = Math.min(Math.max(quantidade * 3, quantidade), POOL_MAXIMO);
    const pool = await Question.aggregate([
      { $match: filtro },
      { $sample: { size: poolSize } },
      { $project: { enunciado: 1, materia: 1, assunto: 1, dificuldade: 1 } },
    ]);

    if (pool.length === 0) {
      throw new Error(
        "Nenhuma questão encontrada para os critérios informados.",
      );
    }

    // Nunca pedir mais questões do que o filtro tem: sem isso o simulado saía
    // com menos questões do que o professor pediu, sem aviso.
    const alvo = Math.min(quantidade, pool.length);
    const questoes = await this.selectQuestionsWithAI(pool, alvo, dificuldade);

    const simulado = new Simulado({
      nome,
      questoes,
      materia,
      vestibular,
      dificuldade,
      quantidadeQuestoes: questoes.length,
      usuario: new mongoose.Types.ObjectId(usuarioId),
    });

    return await simulado.save();
  }

  /**
   * Pede à IA a seleção das questões e devolve EXATAMENTE `quantidade` ids
   * quando o pool permite.
   *
   * Defesas (todas já quebraram em produção de alguma forma):
   * - a IA pode devolver lista vazia sem dar erro;
   * - pode devolver menos itens do que foi pedido;
   * - pode devolver id que não existe no pool (ou repetido).
   * O que faltar é completado por sorteio do próprio pool.
   */
  private static async selectQuestionsWithAI(
    pool: any[],
    quantidade: number,
    dificuldade: string,
  ): Promise<mongoose.Types.ObjectId[]> {
    const doPool = new Map(pool.map((q) => [String(q._id), q._id]));
    const escolhidas: mongoose.Types.ObjectId[] = [];

    const poolMetadata = pool.map((q) => ({
      id: q._id.toString(),
      enunciadoCurto: String(q.enunciado ?? "").substring(0, 100),
      materia: q.materia,
      assunto: q.assunto,
      dificuldade: q.dificuldade,
    }));

    const prompt = `
      Você é um assistente pedagógico. Sua tarefa é selecionar as ${quantidade} melhores questões de um pool de ${pool.length} questões para compor um simulado equilibrado.
      
      Critérios:
      - Diversidade de assuntos.
      - Dificuldade alvo: ${dificuldade}.
      
      POOL DE QUESTÕES:
      ${JSON.stringify(poolMetadata)}
      
      RETORNE APENAS UM ARRAY COM OS IDS SELECIONADOS:
      {
        "selectedIds": ["id1", "id2", ...]
      }
    `;

    try {
      const texto = await gerarConteudoGemini(prompt, {
        json: true,
        contexto: "simulado",
      });
      const data = JSON.parse(texto);
      const ids = Array.isArray(data?.selectedIds) ? data.selectedIds : [];

      for (const id of ids) {
        const real = doPool.get(String(id));
        if (real && !escolhidas.some((e) => String(e) === String(real))) {
          escolhidas.push(real);
        }
      }
    } catch (error) {
      console.error("[SimuladoService] Erro na seleção por IA:", error);
    }

    // Completa o que a IA não entregou com sorteio do pool.
    const restantes = embaralhar(
      pool.filter((q) => !escolhidas.some((e) => String(e) === String(q._id))),
    );
    for (const q of restantes) {
      if (escolhidas.length >= quantidade) break;
      escolhidas.push(q._id);
    }

    return escolhidas.slice(0, quantidade);
  }

  static async listByUser(usuarioId: string) {
    // O aluno precisa das alternativas e da figura para responder — mas nunca
    // do gabarito: `respostaCorreta` fica fora da resposta da API.
    return await Simulado.find({ usuario: usuarioId })
      .sort({ criadoEm: -1 })
      .populate({ path: "questoes", select: "-respostaCorreta" });
  }

  static async getById(id: string) {
    return await Simulado.findById(id).populate("questoes");
  }

  /**
   * Remove o gabarito do simulado antes de devolvê-lo a quem não é admin.
   * Usado tanto na listagem quanto na leitura de um simulado específico.
   */
  static semGabarito(simulado: any) {
    const obj =
      typeof simulado?.toObject === "function" ? simulado.toObject() : simulado;
    if (!obj) return obj;
    obj.questoes = (obj.questoes ?? []).map((q: any) => {
      if (!q || typeof q !== "object") return q;
      const { respostaCorreta, ...resto } = q;
      return resto;
    });
    return obj;
  }

  static async submitAttempt(params: {
    simuladoId: string;
    alunoId: string;
    respostas: { questaoId: string; respostaSelecionada: string }[];
  }) {
    const { simuladoId, alunoId, respostas } = params;

    const simulado = await Simulado.findById(simuladoId).populate("questoes");
    if (!simulado) {
      throw new Error("Simulado não encontrado");
    }

    const questoes = simulado.questoes as any[];
    const respostasMap = new Map(
      respostas.map((r) => [String(r.questaoId), r.respostaSelecionada]),
    );

    const respostasCorrigidas = questoes.map((q) => {
      const selecionada = String(respostasMap.get(String(q._id)) ?? "");
      return {
        questaoId: q._id,
        respostaSelecionada: selecionada,
        correta: isRespostaCorreta(q.respostaCorreta, selecionada),
      };
    });

    const total = questoes.length;
    const acertos = respostasCorrigidas.filter((r) => r.correta).length;

    simulado.tentativas.push({
      aluno: new mongoose.Types.ObjectId(alunoId),
      respostas: respostasCorrigidas,
      notaSoma: acertos,
      finalizadoEm: new Date(),
    });
    await simulado.save();

    return {
      simuladoId: simulado._id,
      total,
      acertos,
      erros: total - acertos,
      percentual: total ? Math.round((acertos / total) * 100) : 0,
      respostas: respostasCorrigidas.map((r, i) => ({
        questaoId: r.questaoId,
        respostaSelecionada: r.respostaSelecionada,
        correta: r.correta,
        respostaCorreta: questoes[i].respostaCorreta,
        enunciado: questoes[i].enunciado,
        alternativas: questoes[i].alternativas,
        imagemUrl: questoes[i].imagemUrl,
        imagemBbox: questoes[i].imagemBbox,
        imagemLargura: questoes[i].imagemLargura,
        imagemAltura: questoes[i].imagemAltura,
        imagemDescricao: questoes[i].imagemDescricao,
      })),
    };
  }
}

/**
 * Compara o gabarito com a resposta marcada.
 * Múltipla escolha (A-E): compara a letra.
 * Somatória/numérico: comparação direta normalizada.
 */
export function isRespostaCorreta(
  gabarito: unknown,
  selecionada: string,
): boolean {
  const g = String(gabarito ?? "").trim().toUpperCase();
  const s = String(selecionada ?? "").trim().toUpperCase();
  if (!s) return false;
  if (/^[A-E]$/.test(g)) return g === s;
  return g === s;
}
