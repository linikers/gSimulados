import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractQuestionsFromImage(
  imageBuffer: Buffer,
  vestibularCodigo: string
): Promise<{
  questoes: Array<{
    enunciado: string;
    alternativas: string[];
    respostaCorreta?: string;
    materia?: string;
    assunto?: string;
    temImagem: boolean;
    imagemUrl?: string;
  }>;
  confidence: number;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
Você é um especialista em extrair questões de provas de vestibular ${vestibularCodigo.toUpperCase()}.

TAREFA: Extraia TODAS as questões desta imagem de prova.

REGRAS:
1. Identifique o enunciado completo de cada questão
2. Liste TODAS as 5 alternativas (A, B, C, D, E)
3. Se houver gabarito visível, identifique a resposta correta
4. Classifique a matéria (Matemática, Física, Química, etc)
5. Identifique o assunto específico (ex: Derivadas, Cinemática)
6. Se a questão contém imagem/gráfico/tabela, marque "temImagem": true

IMPORTANTE:
- Se houver imagem na questão, descreva-a brevemente no enunciado
- Mantenha formatação matemática (use LaTeX se necessário)
- Preserve símbolos e fórmulas
- Retorne APENAS o JSON, sem markdown blocks

RETORNE JSON ARRAY no formato:
{
  "questoes": [
    {
      "enunciado": "Texto completo da questão...",
      "alternativas": [
        "A) Primeira alternativa",
        "B) Segunda alternativa",
        "C) Terceira alternativa",
        "D) Quarta alternativa",
        "E) Quinta alternativa"
      ],
      "respostaCorreta": "A",
      "materia": "Matemática",
      "assunto": "Geometria Analítica",
      "temImagem": true
    }
  ]
}
`;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType: "image/png",
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
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
    confidence: 85, // Gemini geralmente tem boa confiança
  };
}
