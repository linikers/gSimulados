import { gerarConteudoGemini } from "./gemini/gemini-client.service";

export interface QuestaoExtraida {
  numeroQuestao?: number;
  enunciado: string;
  alternativas: string[];
  respostaCorreta?: string;
  tipoQuestao: "multipla_escolha" | "alternativa" | "somatoria";
  temGabarito: boolean;
  materia?: string;
  assunto?: string;
  temImagem: boolean;
  pageNumber: number;
  descricaoFigura?: string;
  imagemBbox?: { x: number; y: number; w: number; h: number };
}

/**
 * Quantas tentativas fazer quando o modelo devolve um resultado pobre.
 *
 * O modelo em uso (flash-lite) é instável: no mesmo PDF ele já devolveu 46
 * questões numa chamada e 1 questão (resposta curta, finishReason=STOP) na
 * seguinte. Não é erro nem truncamento — é resposta ruim mesmo. Então a defesa
 * é repetir e ficar com a melhor tentativa.
 */
const MAX_TENTATIVAS = Number(process.env.EXTRACAO_TENTATIVAS || 3);

/** A partir daqui consideramos o resultado bom e paramos de tentar. */
const MINIMO_CONFIAVEL = Number(process.env.EXTRACAO_MINIMO || 5);

export async function extractQuestionsFromPdf(
  pdfBuffer: Buffer,
  vestibularCodigo: string
): Promise<{
  questoes: QuestaoExtraida[];
  confidence: number;
}> {
  const prompt = `
Você é um professor especialista em vestibulares do exame ${vestibularCodigo.toUpperCase()}.
Sua tarefa é converter o PDF anexo em uma estrutura JSON organizada.

CARACTERÍSTICAS DA PROVA:
- As questões podem ser SOMATÓRIAS (01, 02, 04...) ou MÚLTIPLA ESCOLHA (A, B, C, D, E).
- Se for somatória, a "respostaCorreta" é a soma dos números verdadeiros.

REGRAS DE EXTRAÇÃO:
1. "numeroQuestao": Identifique o número (ex: 21, 22...).
2. "enunciado": Texto base antes das alternativas.
3. "alternativas": Capture o número/letra e o texto (ex: "01) Texto..." ou "A) Texto...").
4. "tipoQuestao": 
   - Use "somatoria" para questões com itens numéricos (01, 02...).
   - Use "multipla_escolha" para itens com letras (A, B...).
5. "respostaCorreta": Procure na folha de gabarito se houver.
6. "materia": Identifique pelo cabeçalho da prova ou contexto.
7. "temImagem": true quando a QUESTÃO depende de uma figura para ser respondida
   (gráfico, tabela de dados, esquema, diagrama, mapa, fotografia).
   "conforme a figura/gráfico/tabela abaixo" => SEMPRE true.
8. "imagemBbox": SOMENTE quando temImagem=true. É a região da figura na página,
   em FRAÇÃO da página (0 a 1): x,y = canto superior esquerdo; w,h = largura/altura.
   Seja preciso — a região deve conter a figura inteira, e nada além dela.
9. "descricaoFigura": descrição curta do que a figura mostra.

FORMATO DE RETORNO (JSON APENAS):
{
  "questoes": [
    {
      "numeroQuestao": number,
      "enunciado": "string",
      "alternativas": ["string"],
      "respostaCorreta": "string",
      "tipoQuestao": "somatoria" | "multipla_escolha",
      "temGabarito": boolean,
      "materia": "string",
      "assunto": "string",
      "temImagem": boolean,
      "pageNumber": number,
      "descricaoFigura": "string (só se temImagem)",
      "imagemBbox": {"x": number, "y": number, "w": number, "h": number}
    }
  ]
}
`;

  const pdfPart = {
    inlineData: {
      data: pdfBuffer.toString("base64"),
      mimeType: "application/pdf",
    },
  };

  const parsearQuestoes = (text: string): QuestaoExtraida[] => {
    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("IA não retornou JSON válido");
    }

    const data = JSON.parse(jsonMatch[0]);
    return data.questoes || [];
  };

  let melhor: QuestaoExtraida[] = [];
  let ultimoErro: unknown;

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      console.log(
        `[Gemini] Extração — tentativa ${tentativa}/${MAX_TENTATIVAS}...`,
      );
      const text = await gerarConteudoGemini([prompt, pdfPart], {
        json: true,
        contexto: "gemini-vision",
      });

      const questoes = parsearQuestoes(text);
      console.log(
        `[Gemini] tentativa ${tentativa}: ${questoes.length} questões (${text.length} chars)`,
      );

      if (questoes.length > melhor.length) melhor = questoes;
      if (melhor.length >= MINIMO_CONFIAVEL) break;

      if (tentativa < MAX_TENTATIVAS) {
        console.warn(
          `[Gemini] resultado pobre (${melhor.length} < ${MINIMO_CONFIAVEL}) — repetindo`,
        );
      }
    } catch (error: any) {
      ultimoErro = error;
      console.error(
        `[Gemini] tentativa ${tentativa} falhou: ${error.message}` +
          (error.status ? ` (status ${error.status})` : ""),
      );
    }
  }

  if (melhor.length === 0) {
    throw ultimoErro instanceof Error
      ? ultimoErro
      : new Error("A extração não retornou nenhuma questão");
  }

  return { questoes: melhor, confidence: 85 };
}
