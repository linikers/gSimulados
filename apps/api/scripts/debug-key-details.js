
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'apps/api/service-account.json');

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const pk = data.private_key;

    console.log("=== Analisando Chave Privada em Detalhes ===");
    const lines = pk.split('\n');
    console.log(`Total de linhas: ${lines.length}`);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (i === 0 || i === lines.length - 1 || i === lines.length - 2) {
            console.log(`Linha ${i}: [${line}] (Tamanho: ${line.length})`);
        }
    }

    if (lines[0].includes("-----BEGIN PRIVATE KEY-----")) {
        console.log("✅ Header OK");
    } else {
        console.log("❌ Header PROBLEM");
    }

    if (pk.trim().endsWith("-----END PRIVATE KEY-----")) {
        console.log("✅ Footer OK (com trim)");
    } else {
        console.log("❌ Footer PROBLEM (mesmo com trim)");
    }

} catch (e) {
    console.error(e.message);
}
