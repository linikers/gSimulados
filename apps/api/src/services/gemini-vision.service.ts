import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export async function extractQuestionsFromPdf(
  pdfBuffer: Buffer,
  vestibularCodigo: string
): Promise<{
  questoes: Array<{
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
1. Identifique o enunciado completo de cada questão.
2. Liste TODAS as 5 alternativas (A, B, C, D, E).
3. Determine o "tipoQuestao": 
   - "alternativa": se a questão for do tipo que pede para assinalar a sequência correta de afirmações (ex: I, II, III são verdadeiras) ou se no PDF as opções forem apenas as letras (ex: A, B, C, D, E sem texto ao lado).
   - "multipla_escolha": para questões tradicionais com texto em cada alternativa.
4. Se houver gabarito visível no documento para a questão, identifique a resposta correta e marque "temGabarito": true. Se não houver gabarito explícito para aquela questão, deixe null ou "temGabarito": false.
5. Use APENAS a letra (A, B, C, D ou E) para "respostaCorreta".
6. Classifique a matéria (Matemática, Física, Química, etc).
7. Identifique o assunto específico (ex: Derivadas, Cinemática).
8. Se a questão contém imagem/gráfico/tabela, marque "temImagem": true.
9. Identifique EXATAMENTE em qual página do PDF a questão começa (pageNumber).

IMPORTANTE:
- O campo "respostaCorreta" deve ser EXATAMENTE uma das letras: "A", "B", "C", "D", "E" ou null.
- Mantenha formatação matemática (use LaTeX se necessário).
- Retorne APENAS o JSON, sem markdown blocks.

RETORNE JSON ARRAY no formato:
{
  "questoes": [
    {
      "enunciado": "Texto completo da questão...",
      "alternativas": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "respostaCorreta": "A",
      "tipoQuestao": "multipla_escolha",
      "temGabarito": true,
      "materia": "Matemática",
      "assunto": "Geometria Analítica",
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
