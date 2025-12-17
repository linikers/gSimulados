
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const filePath = path.join(process.cwd(), 'apps/api/service-account.json');

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const privateKey = data.private_key;

    console.log("=== Teste de Assinatura Criptográfica ===");
    console.log(`Client Email: ${data.client_email}`);
    
    // 1. Tentar criar um signer
    console.log("1. Tentando carregar chave privada no node crypto...");
    try {
        const sign = crypto.createSign('RSA-SHA256');
        sign.update('test data');
        const signature = sign.sign(privateKey, 'base64');
        console.log("✅ Chave privada carregada e assinatura LOCAL gerada com sucesso!");
    } catch (e) {
        console.error("❌ FALHA ao carregar chave ou assinar localmente:", e.message);
        if (e.message.includes("PEM")) {
            console.error("💡 A chave parece estar com formato PEM inválido (header/footer ou quebras de linha).");
        }
    }

    // 2. Verificar quebras de linha
    const lines = privateKey.split('\n');
    console.log(`\n2. Estrutura da chave: ${lines.length} linhas detectadas.`);
    if (lines[0].trim() !== "-----BEGIN PRIVATE KEY-----") {
        console.error("❌ Header inválido:", lines[0]);
    }
    if (lines[lines.length - 1].trim() !== "-----END PRIVATE KEY-----") {
        console.error("❌ Footer inválido:", lines[lines.length - 1]);
    }

} catch (e) {
    console.error("Erro no script:", e.message);
}
