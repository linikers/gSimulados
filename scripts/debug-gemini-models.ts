import { env } from "../apps/api/src/config/env";

async function listModels() {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error(
      "❌ GEMINI_API_KEY não definida no .env ou arquivo de config."
    );
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  console.log(
    "🔍 Consultando API do Gemini para listar modelos disponíveis..."
  );
  console.log(`URL: https://generativelanguage.googleapis.com/v1beta/models`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    console.log("\n✅ Modelos Disponíveis:");
    console.log("----------------------------------------");
    if (data.models) {
      data.models.forEach((m: any) => {
        console.log(`- Nome: ${m.name}`);
        console.log(`  Versão: ${m.version}`);
        console.log(`  Descrição: ${m.description}`);
        console.log(
          `  Métodos Suportados: ${m.supportedGenerationMethods.join(", ")}`
        );
        console.log("  ---");
      });
    } else {
      console.log("Nenhum modelo retornado ou formato inesperado:", data);
    }
    console.log("----------------------------------------");
  } catch (error: any) {
    console.error("❌ Falha ao listar modelos:", error.message);
  }
}

listModels();
