import { testGeminiConnectivity } from "./src/services/ai-diagnostics.service";

testGeminiConnectivity().then(success => {
    if (success) {
        console.log("O sistema de IA está configurado corretamente.");
        process.exit(0);
    } else {
        console.log("O sistema de IA falhou. Verifique sua GEMINI_API_KEY.");
        process.exit(1);
    }
});
