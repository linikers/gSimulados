import { Question } from "../models/Question";
import { Simulado } from "../models/Simulado";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import mongoose from "mongoose";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export class SimuladoService {
  static async generate(params: {
    nome: string;
    materia?: string;
    dificuldade: "facil" | "medio" | "dificil" | "misto";
    quantidade: number;
    usuarioId: string;
  }) {
    const { nome, materia, dificuldade, quantidade, usuarioId } = params;

    // 1. Buscar pool de questões candidatas
    const query: any = {};
    if (materia) query.materia = materia;
    if (dificuldade !== "misto") query.dificuldade = dificuldade;

    // Pegamos um pool maior para a IA escolher de forma performática
    const poolSize = quantidade * 3;
    const pool = await Question.find(query)
      .limit(poolSize)
      .select("_id enunciado materia assunto dificuldade");

    if (pool.length === 0) {
      throw new Error(
        "Nenhuma questão encontrada para os critérios informados.",
      );
    }

    // 2. Usar IA para selecionar as melhores/mais diversas
    const selectedIds = await this.selectQuestionsWithAI(
      pool,
      quantidade,
      dificuldade,
    );

    // 3. Salvar Simulado
    const simulado = new Simulado({
      nome,
      questoes: selectedIds,
      materia,
      dificuldade,
      quantidadeQuestoes: selectedIds.length,
      usuario: new mongoose.Types.ObjectId(usuarioId),
    });

    return await simulado.save();
  }

  private static async selectQuestionsWithAI(
    pool: any[],
    quantidade: number,
    dificuldade: string,
  ): Promise<mongoose.Types.ObjectId[]> {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: { responseMimeType: "application/json" },
    });

    const poolMetadata = pool.map((q) => ({
      id: q._id.toString(),
      enunciadoCurto: q.enunciado.substring(0, 100),
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
      
      RETORNE APENAS UM ARRAY COM OS IDs SELECIONADOS:
      {
        "selectedIds": ["id1", "id2", ...]
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const data = JSON.parse(response.text());

      const ids = data.selectedIds || [];
      return ids.map((id: string) => new mongoose.Types.ObjectId(id));
    } catch (error) {
      console.error("[SimuladoService] Erro na seleção por IA:", error);
      // Fallback: seleção aleatória se a IA falhar
      return pool
        .sort(() => 0.5 - Math.random())
        .slice(0, quantidade)
        .map((q) => q._id);
    }
  }

  static async listByUser(usuarioId: string) {
    return await Simulado.find({ usuario: usuarioId })
      .sort({ criadoEm: -1 })
      .populate("questoes", "enunciado materia assunto");
  }

  static async getById(id: string) {
    return await Simulado.findById(id).populate("questoes");
  }
}
