
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'apps/api/service-account.json');

console.log(`🛠️ Iniciando normalização de: ${filePath}`);

if (!fs.existsSync(filePath)) {
    console.error("❌ Arquivo não encontrado!");
    process.exit(1);
}

try {
    const rawContent = fs.readFileSync(filePath, 'utf8');
    
    // 1. Limpar espaços/caracteres invisíveis no início/fim do arquivo
    const trimmedContent = rawContent.trim();
    
    // 2. Parsear JSON
    const data = JSON.parse(trimmedContent);
    
    if (!data.private_key) {
        throw new Error("Campo 'private_key' ausente.");
    }
    
    // 3. Normalizar Private Key
    // Se a chave veio como string com literal "\n" reais (newlines), o JSON.parse já resolveu.
    // Mas se ela veio com "\\n" (backslash literal + n), precisamos converter.
    let pk = data.private_key;
    if (pk.includes("\\n")) {
        console.log("⚠️ Detectado '\\\\n' literal na chave. Convertendo para quebras de linha reais...");
        pk = pk.replace(/\\n/g, '\n');
    }
    
    // Garantir que não há espaços extras em cada linha da chave
    data.private_key = pk.split('\n').map(line => line.trim()).join('\n');
    
    // 4. Salvar novamente como JSON limpo
    const cleanJson = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, cleanJson, 'utf8');
    
    console.log("✅ Arquivo normalizado e salvo com sucesso!");
    console.log("💡 Tente rodar o teste novamente.");

} catch (e) {
    console.error("❌ Erro ao normalizar o arquivo:", e.message);
}
