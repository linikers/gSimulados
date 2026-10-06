import { env } from "../config/env";
import { gerarConteudoGemini, GEMINI_MODELOS } from "./gemini/gemini-client.service";

export async function testGeminiConnectivity() {
    console.log("--- 🔍 DIAGNÓSTICO DE IA ---");
    console.log(`Versão do SDK: Conectando com a chave terminada em: ...${env.GEMINI_API_KEY.slice(-4)}`);
    console.log(`Modelos (com fallback): ${GEMINI_MODELOS.join(", ")}`);

    try {
        const texto = await gerarConteudoGemini("Diga 'OK' se você estiver funcionando.", {
            contexto: "diagnostico",
        });
        console.log("✅ RESPOSTA DA IA:", texto);
        return true;
    } catch (error: any) {
        console.error("❌ FALHA NO DIAGNÓSTICO:");
        console.error("Mensagem:", error.message);
        if (error.status) console.error("Status HTTP:", error.status);
        return false;
    }
}
