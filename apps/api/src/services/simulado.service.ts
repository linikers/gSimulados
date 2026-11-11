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
   * Agregados do aluno para a página "Meu Desempenho".
   * Só tentativas do próprio aluno; a matéria vem da questão do simulado.
   */
  static async desempenho(usuarioId: string) {
    const simulados = await Simulado.find({ "tentativas.aluno": usuarioId })
      .select("nome questoes tentativas")
      .populate({ path: "questoes", select: "materia" })
      .lean();

    const porMateriaMap = new Map<
      string,
      { materia: string; questoes: number; acertos: number }
    >();
    const resultados: {
      simuladoId: string;
      nome: string;
      data: Date;
      acertos: number;
      total: number;
      percentual: number;
    }[] = [];

    let totalQuestoes = 0;
    let totalAcertos = 0;

    for (const simulado of simulados) {
      const materiaDaQuestao = new Map<string, string>();
      for (const questao of (simulado.questoes as any[]) ?? []) {
        materiaDaQuestao.set(
          String(questao._id),
          questao.materia || "Outras",
        );
      }

      for (const tentativa of simulado.tentativas ?? []) {
        if (String(tentativa.aluno) !== String(usuarioId)) continue;
        const respostas = tentativa.respostas ?? [];
        if (respostas.length === 0) continue;

        const acertos = respostas.filter((r) => r.correta).length;
        totalQuestoes += respostas.length;
        totalAcertos += acertos;

        resultados.push({
          simuladoId: String(simulado._id),
          nome: simulado.nome,
          data: tentativa.finalizadoEm,
          acertos,
          total: respostas.length,
          percentual: Math.round((acertos / respostas.length) * 100),
        });

        for (const resposta of respostas) {
          const materia =
            materiaDaQuestao.get(String(resposta.questaoId)) || "Outras";
          const atual = porMateriaMap.get(materia) ?? {
            materia,
            questoes: 0,
            acertos: 0,
          };
          atual.questoes += 1;
          if (resposta.correta) atual.acertos += 1;
          porMateriaMap.set(materia, atual);
        }
      }
    }

    // Mais recente primeiro; a evolução usa os 10 últimos em ordem cronológica.
    resultados.sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
    );

    const porMateria = [...porMateriaMap.values()]
      .map((m) => ({
        ...m,
        percentual: Math.round((m.acertos / m.questoes) * 100),
      }))
      .sort((a, b) => a.percentual - b.percentual);

    return {
      totais: {
        simulados: resultados.length,
        questoes: totalQuestoes,
        acertos: totalAcertos,
        percentual:
          totalQuestoes > 0
            ? Math.round((totalAcertos / totalQuestoes) * 100)
            : 0,
      },
      porMateria,
      evolucao: resultados.slice(0, 10).reverse(),
      resultados: resultados.slice(0, 20),
    };
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
    /** Admin pode responder no simulado de qualquer aluno (como no GET). */
    isAdmin?: boolean;
  }) {
    const { simuladoId, alunoId, respostas, isAdmin = false } = params;

    const simulado = await Simulado.findById(simuladoId).populate("questoes");
    if (!simulado) {
      throw new Error("Simulado não encontrado");
    }

    // Mesma regra do GET /simulados/:id: responder/gravar tentativa no
    // simulado de outro aluno é proibido. Sem isto qualquer usuário
    // autenticado gravava tentativa na prova alheia.
    const isOwner = String(simulado.usuario) === String(alunoId);
    if (!isOwner && !isAdmin) {
      const erro: any = new Error("Acesso negado");
      erro.status = 403;
      throw erro;
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
