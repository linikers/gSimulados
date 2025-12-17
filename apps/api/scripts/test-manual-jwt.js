
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const filePath = path.join(process.cwd(), 'apps/api/service-account.json');

async function testManualJwt() {
    console.log("=== Teste de JWT Manual com Offset ===");
    
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const privateKey = data.private_key;
        const clientEmail = data.client_email;

        // Criar o payload do JWT para o endpoint de token do Google
        // https://developers.google.com/identity/protocols/oauth2/service-account#jwt-assertion
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            iss: clientEmail,
            scope: "https://www.googleapis.com/auth/drive.readonly",
            aud: "https://oauth2.googleapis.com/token",
            exp: now + 3600,
            iat: now - 300 // 5 MINUTOS NO PASSADO para garantir aceitação mesmo com relógio adiantado
        };

        console.log("1. Assinando JWT manualmente (5 min offset)...");
        const token = jwt.sign(payload, privateKey, { algorithm: 'RS256', keyid: data.private_key_id });
        console.log("✅ JWT Assinado!");

        console.log("\n2. Trocando JWT por Access Token no Google...");
        const res = await axios.post('https://oauth2.googleapis.com/token', 
            `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        console.log("✅ Sucesso Absoluto! Access Token obtido!");
        console.log("Token:", res.data.access_token.substring(0, 20) + "...");

    } catch (e) {
        console.error("\n❌ FALHA NO TESTE:");
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", JSON.stringify(e.response.data, null, 2));
        } else {
            console.error(e.message);
        }
        
        if (e.message.includes("PEM")) {
            console.log("💡 O erro PEM confirma que o formato da Private Key ainda está ruim.");
        }
    }
}

testManualJwt();
