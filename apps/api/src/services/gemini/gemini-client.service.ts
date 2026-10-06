import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

/**
 * Ordem de preferência dos modelos.
 *
 * O alias `gemini-flash-latest` oscila entre 503 (high demand) e alguns modelos
 * são descontinuados (404 "no longer available"), então nunca dependemos de um
 * único nome. Configurável por env: GEMINI_MODELOS="modelo1,modelo2".
 */
export const GEMINI_MODELOS: string[] = (
  process.env.GEMINI_MODELOS ||
  "gemini-flash-latest,gemini-flash-lite-latest,gemini-2.5-flash-lite"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const TENTATIVAS_POR_MODELO = Number(process.env.GEMINI_TENTATIVAS || 2);

/**
 * Guarda qual modelo respondeu por último para tentá-lo primeiro nas próximas
 * chamadas. Sem isso, todo request paga o custo de falhar no modelo que está
 * fora do ar antes de cair no alternativo.
 */
let modeloPreferido: string | null = null;

function ordemDosModelos(): string[] {
  if (modeloPreferido && GEMINI_MODELOS.includes(modeloPreferido)) {
    return [
      modeloPreferido,
      ...GEMINI_MODELOS.filter((m) => m !== modeloPreferido),
    ];
  }
  return GEMINI_MODELOS;
}

export type ConteudoGemini =
  | string
  | Array<string | { inlineData: { mimeType: string; data: string } }>;

/** Extrai o status HTTP de um erro do SDK do Gemini ("... [503 Service Unavailable]"). */
export function extrairStatusErro(error: unknown): number | undefined {
  const message = (error as Error)?.message ?? "";
  const porColchete = message.match(/\[(\d{3})[\s\]]/);
  if (porColchete) return Number(porColchete[1]);

  const status = (error as { status?: unknown })?.status;
  return typeof status === "number" ? status : undefined;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Chama o Gemini com fallback de modelo e retry.
 *
 * - 429/503 (transitório): repete o mesmo modelo e, se persistir, passa ao próximo.
 * - 404/400 (modelo morto/inválido): pula direto para o próximo modelo.
 *
 * Devolve o texto da resposta.
 */
export async function gerarConteudoGemini(
  conteudo: ConteudoGemini,
  options: { json?: boolean; contexto?: string } = {},
): Promise<string> {
  const { json = false, contexto = "gemini" } = options;
  const falhas: string[] = [];

  for (const modelo of ordemDosModelos()) {
    for (let tentativa = 1; tentativa <= TENTATIVAS_POR_MODELO; tentativa++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelo,
          ...(json
            ? { generationConfig: { responseMimeType: "application/json" } }
            : {}),
        });

        const result = await model.generateContent(conteudo);
        if (modelo !== GEMINI_MODELOS[0]) {
          console.warn(`[${contexto}] respondido pelo modelo alternativo "${modelo}"`);
        }
        modeloPreferido = modelo;
        return result.response.text();
      } catch (error) {
        const status = extrairStatusErro(error);
        const mensagem = (error as Error)?.message ?? String(error);
        falhas.push(`${modelo}:${status ?? mensagem.slice(0, 60)}`);
        console.warn(
          `[${contexto}] ${modelo} falhou (${status ?? "sem status"}) — tentativa ${tentativa}/${TENTATIVAS_POR_MODELO}`,
        );

        const transitorio = status === 429 || status === 503;
        // Modelo morto/inválido: não adianta insistir nele.
        if (!transitorio) break;
        if (tentativa < TENTATIVAS_POR_MODELO) await sleep(1500 * tentativa);
      }
    }
  }

  throw new Error(
    `Nenhum modelo Gemini respondeu (${GEMINI_MODELOS.join(", ")}). Falhas: ${falhas.join(" | ")}`,
  );
}
