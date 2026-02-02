import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { AuditLog } from "../models/AuditLog";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export class GeminiAuditService {
    /**
     * Realiza uma auditoria acadêmica de uma questão.
     * Atua como um professor revisor.
     */
    static async auditQuestion(questionData: any, _context: string = "Vestibular") {
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: { responseMimeType: "application/json" },
        });

        const prompt = `
Você é um Professor Acadêmico e Revisor de Provas de Vestibular.
Sua tarefa é auditar a seguinte questão para garantir precisão técnica, clareza e correção do gabarito.

QUESTÃO A SER AUDITADA:
Enunciado: ${questionData.enunciado}
Alternativas: ${JSON.stringify(questionData.alternativas)}
Gabarito Sugerido: ${questionData.respostaCorreta || "NÃO FORNECIDO"}
Matéria: ${questionData.materia}
Assunto: ${questionData.assunto}

DIRETRIZES DE REVISÃO:
1. Verifique se o enunciado tem clareza pedagógica.
2. Valide se as alternativas são plausíveis e se existe APENAS uma correta (ou a soma correta, em caso de somatória).
3. Se o gabarito estiver ausente ou incorreto, você DEVE resolvê-la e fornecer o gabarito correto.
4. Identifique erros de digitação, termos técnicos incorretos ou ambiguidades.

FORMATO DE RETORNO (JSON APENAS):
{
  "status": "approved" | "corrected" | "flagged",
  "confidence": number (0-100),
  "feedback": "string explicativa detalhando sua análise",
  "gabaritoCorreto": "string (A, B, C, D, E ou número)",
  "campoCorrigido": "string (ex: enunciado, alternativas, gabarito ou nenhum)",
  "academicRole": "Professor Revisor Acadêmico"
}
`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const auditResult = JSON.parse(text);

            // Log da auditoria
            await AuditLog.create({
                entityType: "question",
                entityId: questionData._id,
                action: "ia_review",
                performedBy: "ia",
                details: {
                    previousValue: { respostaCorreta: questionData.respostaCorreta },
                    newValue: { respostaCorreta: auditResult.gabaritoCorreto },
                    auditResult: {
                        status: auditResult.status,
                        confidence: auditResult.confidence,
                        feedback: auditResult.feedback,
                        academicRole: auditResult.academicRole
                    }
                }
            });

            return auditResult;
        } catch (error: any) {
            console.error("[GeminiAuditService] Erro na auditoria:", error.message);

            // Graceful Degradation: Retornar um resultado de falha em vez de estourar erro 500
            return {
                status: "flagged",
                confidence: 0,
                feedback: `IA Indisponível (Erro: ${error.message}). Por favor, revise manualmente ou tente novamente mais tarde.`,
                academicRole: "Sistema de Auditoria (Modo de Segurança)"
            };
        }
    }
}
