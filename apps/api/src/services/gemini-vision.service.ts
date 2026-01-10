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
    materia?: string;
    assunto?: string;
    temImagem: boolean;
    pageNumber: number;
  }>;
  confidence: number;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
Você é um professor especialista em extrair questões de provas de vestibular ${vestibularCodigo.toUpperCase()}.

TAREFA: Analise o documento PDF em anexo e extraia TODAS as questões, incluindo  as respectivar imagens e fórmulas contidas em cada questão.

REGRAS:
1. Identifique o enunciado completo de cada questão.
2. Liste TODAS as 5 alternativas (A, B, C, D, E).
3. Se houver gabarito visível no documento, identifique a resposta correta. Use APENAS a letra (A, B, C, D ou E). Se não tiver certeza, deixe null.
4. Classifique a matéria (Matemática, Física, Química, etc).
5. Identifique o assunto específico (ex: Derivadas, Cinemática).
6. Se a questão contém imagem/gráfico/tabela, marque "temImagem": true.
7. Identifique EXATAMENTE em qual página do PDF a questão começa (pageNumber).

IMPORTANTE:
- O campo "respostaCorreta" deve ser EXATAMENTE uma das letras: "A", "B", "C", "D", "E" ou null. NÃO coloque números ou textos longos.
- Se houver imagem na questão, descreva-a brevemente no enunciado.
- Mantenha formatação matemática (use LaTeX se necessário).
- Preserve símbolos e fórmulas.
- Retorne APENAS o JSON, sem markdown blocks.

RETORNE JSON ARRAY no formato:
{
  "questoes": [
    {
      "enunciado": "Texto completo da questão...",
      "alternativas": [
        "A) ...",
        "B) ...",
        "C) ...",
        "D) ...",
        "E) ..."
      ],
      "respostaCorreta": "A",
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

  const result = await model.generateContent([prompt, pdfPart]);
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
}
