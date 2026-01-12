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
    tipoQuestao: "multipla_escolha" | "alternativa";
    temGabarito: boolean;
    materia?: string;
    assunto?: string;
    temImagem: boolean;
    pageNumber: number;
  }>;
  confidence: number;
}> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = `
Você é um professor especialista em extrair questões de provas de vestibular ${vestibularCodigo.toUpperCase()}.

TAREFA: Analise o documento PDF em anexo e extraia TODAS as questões, incluindo  as respectivar imagens e fórmulas contidas em cada questão.

REGRAS:
1. Identifique o número da questão se houver (ex: "Questão 15" -> numeroQuestao: 15).
2. Identifique o enunciado completo de cada questão.
3. Liste TODAS as alternativas disponíveis (A, B, C, D, E ou 01, 02, 04, 08, 16, 32...). NÃO limite a 5, capture todas que existirem.
4. Determine o "tipoQuestao": 
   - "alternativa": para questões do tipo somatória (01, 02, 04...) ou sequências (I, II, III).
   - "multipla_escolha": para questões tradicionais com texto em cada alternativa.
5. Se houver gabarito visível, marque "temGabarito": true e preencha "respostaCorreta".
6. Classifique a matéria (Matemática, Física, Química, etc) e assunto.
7. Se a questão contém imagem/gráfico/tabela, marque "temImagem": true.
8. Identifique EXATAMENTE em qual página do PDF a questão começa (pageNumber).

IMPORTANTE:
- "respostaCorreta" pode ser letra (A, B...) ou número (01, 15...).
- Mantenha formatação matemática (LaTeX).
- Retorne apenas JSON válido.

RETORNE JSON ARRAY no formato:
{
  "questoes": [
    {
      "numeroQuestao": 15,
      "enunciado": "Texto completo...",
      "alternativas": ["A) ...", "B) ..."],
      "respostaCorreta": "A",
      "tipoQuestao": "multipla_escolha",
      "temGabarito": true,
      "materia": "Matemática",
      "assunto": "Geometria",
      "temImagem": true,
      "pageNumber": 1
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
