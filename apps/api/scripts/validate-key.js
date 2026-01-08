
const fs = require('fs');
const path = require('path');

const paths = [
    path.join(__dirname, 'service-account.json'),
    path.join(process.cwd(), 'service-account.json'),
    path.join(process.cwd(), 'apps/api/service-account.json')
];

let found = false;
for (const p of paths) {
    if (fs.existsSync(p)) {
        console.log(`\n✅ Arquivo encontrado em: ${p}`);
        found = true;
        try {
            const content = fs.readFileSync(p, 'utf8');
            const data = JSON.parse(content);
            
            if (!data.private_key) {
                console.error("ERRO: Campo 'private_key' não encontrado no JSON.");
            } else {
                console.log("Campo 'private_key' encontrado.");
                if (data.private_key.includes("-----BEGIN PRIVATE KEY-----")) {
                    console.log("Header da chave está correto.");
                } else {
                    console.error("ERRO: 'private_key' não parece ser uma chave RSA válida (falta o header).");
                }
                
                if (data.private_key.includes("\\n")) {
                     console.log("⚠️ AVISO: A chave contém caracteres de escape literais '\\n'. Isso pode ser o problema se não for um JSON válido.");
                }
            }
            
            if (!data.client_email) {
                 console.error("ERRO: Campo 'client_email' não encontrado.");
            } else {
                 console.log(`Client Email: ${data.client_email}`);
            }

        } catch (e) {
            console.error("ERRO CRÍTICO: O arquivo não é um JSON válido.", e.message);
        }
        break;
    }
}

if (!found) {
    console.error("NENHUM arquivo service-account.json encontrado nos caminhos padrões.");
}
