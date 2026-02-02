import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";

export async function testGeminiConnectivity() {
    console.log("--- 🔍 DIAGNÓSTICO DE IA ---");
    console.log(`Versão do SDK: Conectando com a chave terminada em: ...${env.GEMINI_API_KEY.slice(-4)}`);

    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    try {
        const result = await model.generateContent("Diga 'OK' se você estiver funcionando.");
        const response = await result.response;
        console.log("✅ RESPOSTA DA IA:", response.text());
        return true;
    } catch (error: any) {
        console.error("❌ FALHA NO DIAGNÓSTICO:");
        console.error("Mensagem:", error.message);
        if (error.status) console.error("Status HTTP:", error.status);
        return false;
    }
}
