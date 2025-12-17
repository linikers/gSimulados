
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const filePath = path.join(process.cwd(), 'apps/api/service-account.json');

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const privateKey = data.private_key;

    console.log("=== Teste de Consistência Criptográfica ===");

    // 1. Gerar assinatura
    const message = "verificacao-padrao-gsimulados";
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(message);
    const signature = sign.sign(privateKey, 'base64');
    console.log("✅ 1. Mensagem assinada localmente.");

    // 2. Derivar chave pública da privada
    const publicKey = crypto.createPublicKey(privateKey);
    console.log("✅ 2. Chave pública derivada da privada com sucesso.");

    // 3. Verificar assinatura
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(message);
    const isVerified = verify.verify(publicKey, signature, 'base64');

    if (isVerified) {
        console.log("✅ 3. VERIFICAÇÃO LOCAL BATEU! A chave é matematicamente consistente.");
    } else {
        console.error("❌ 3. FALHA NA VERIFICAÇÃO LOCAL! A chave não assina/verifica consistentemente.");
    }

} catch (e) {
    console.error("❌ ERRO NO PROCESSO:", e.message);
}
