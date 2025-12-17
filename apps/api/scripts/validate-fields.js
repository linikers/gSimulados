
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'apps/api/service-account.json');

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const required = [
        'type', 'project_id', 'private_key_id', 'private_key', 
        'client_email', 'client_id', 'auth_uri', 'token_uri'
    ];

    console.log("=== Validação de Campos JSON ===");
    required.forEach(field => {
        if (!data[field]) {
            console.error(`❌ Campo AUSENTE: ${field}`);
        } else {
            console.log(`✅ Campo PRESENTE: ${field}`);
        }
    });

    if (data.type !== 'service_account') {
        console.error(`❌ Tipo incorreto: ${data.type}`);
    }

    if (!data.token_uri.includes('oauth2.googleapis.com/token')) {
        console.warn(`⚠️ Token URI não padrão: ${data.token_uri}`);
    }

} catch (e) {
    console.error(e.message);
}
