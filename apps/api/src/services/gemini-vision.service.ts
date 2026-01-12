import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export async function extractQuestionsFromPdf(
  pdfBuffer: Buffer,
  vestibularCodigo: string
): Promise<{
  questoes: Array<{
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
  }>;
  confidence: number;
}> {
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

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
      "pageNumber": number
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

  try {
    console.log(
      `[Gemini] Enviando prompt para o modelo gemini-flash-latest...`
    );
    const result = await model.generateContent([prompt, pdfPart]);
    console.log(`[Gemini] Resposta recebida. Processando texto...`);
    const response = await result.response;
    const text = response.text();

    // Limpar markdown blocks se houver
    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Parse JSON
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("IA não retornou JSON válido");
    }

    const data = JSON.parse(jsonMatch[0]);

    return {
      questoes: data.questoes || [],
      confidence: 85,
    };
  } catch (error: any) {
    console.error(`[Gemini] Erro ao chamar API: ${error.message}`);
    if (error.status)
      console.error(
        `[Gemini] Status HTTP: ${error.status} ${error.statusText}`
      );
    throw error;
  }
}
