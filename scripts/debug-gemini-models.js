const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Carregar .env do app/api
const envPath = path.resolve(__dirname, '../apps/api/.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log("✅ .env carregado de:", envPath);
} else {
    console.error("❌ .env não encontrado em:", envPath);
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY não encontrada!");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
console.log(`\n🔍 Consultando Modelos em: ${url.replace(apiKey, "API_KEY_HIDDEN")}`);

async function run() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
            const body = await response.text();
            console.error("Body:", body);
            return;
        }

        const data = await response.json();
        console.log("\n✅ Modelos Disponíveis:");
        if (data.models) {
            console.log("MODELS_START");
            data.models.forEach(m => {
                console.log(m.name);
            });
            console.log("MODELS_END");
        }
    } catch (err) {
        console.error("Erro:", err);
    }
}

run();
