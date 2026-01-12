import { google } from "googleapis";
import path from "path";
import fs from "fs";

// DIAGNOSTIC SCRIPT PARA AUTENTICAÇÃO GOOGLE DRIVE

async function runDiagnosis() {
  console.log("==================================================");
  console.log("🕵️  DIAGNÓSTICO DE AUTENTICAÇÃO GOOGLE DRIVE");
  console.log("==================================================");

  // 1. Verificar Data do Sistema
  const now = new Date();
  console.log(`\n[1] Checando Relógio do Sistema:`);
  console.log(`   DATA LOCAL: ${now.toString()}`);
  console.log(`   DATA ISO:   ${now.toISOString()}`);
  console.log(`   TIMESTAMP:  ${now.getTime()}`);

  // 2. Localizar Service Account
  console.log(`\n[2] Localizando service-account.json:`);
  const possiblePaths = [
    path.join(process.cwd(), "service-account.json"),
    path.join(process.cwd(), "apps/api/service-account.json"),
    path.join(__dirname, "../service-account.json"),
    path.join(__dirname, "../apps/api/service-account.json"),
  ];

  let keyPath = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      keyPath = p;
      console.log(`   ✅ Encontrado em: ${keyPath}`);
      break;
    } else {
      console.log(`   ❌ Não encontrado em: ${p}`);
    }
  }

  if (!keyPath) {
    console.error(
      "   ⛔ ERRO FATAL: Arquivo service-account.json NÃO ENCONTRADO em lugar nenhum!"
    );
    return;
  }

  // 3. Ler e Validar JSON
  console.log(`\n[3] Validando Conteúdo do Arquivo:`);
  let credentials;
  try {
    const content = fs.readFileSync(keyPath, "utf8");
    credentials = JSON.parse(content);
    console.log(`   ✅ JSON Válido.`);
    console.log(`   📧 Client Email: ${credentials.client_email}`);
    console.log(`   🆔 Project ID:   ${credentials.project_id}`);
    console.log(`   🗝️ Private Key ID: ${credentials.private_key_id}`);
  } catch (err: any) {
    console.error(`   ⛔ ERRO AO LER JSON: ${err.message}`);
    return;
  }

  // 4. Analisar Private Key
  console.log(`\n[4] Analisando Chave Privada:`);
  const rawKey = credentials.private_key || "";
  console.log(`   Tamanho Original: ${rawKey.length} caracteres`);

  const sanitizedKey = rawKey.replace(/\\n/g, "\n").replace(/\r/g, "").trim();
  console.log(`   Tamanho Sanitizado: ${sanitizedKey.length} caracteres`);

  if (
    sanitizedKey.includes("BEGIN PRIVATE KEY") &&
    sanitizedKey.includes("END PRIVATE KEY")
  ) {
    console.log(`   ✅ Headers OpenSSL encontrados.`);
  } else {
    console.error(
      `   ⛔ ERRO: Headers da chave não encontrados ou corrompidos.`
    );
  }

  // 5. Teste de Autenticação (JWT Direto) com Correção de Clock Skew
  console.log(`\n[5] Testando Autenticação Real com Google (JWT):`);

  // Patch de -5 minutos apenas para este teste
  const originalDateNow = Date.now;
  Date.now = () => originalDateNow() - 5 * 60 * 1000;
  console.log(
    `   ⏱️  Aplicando patch de -5 minutos no Date.now() para o teste...`
  );

  const jwtClient = new google.auth.JWT({
    email: credentials.client_email,
    key: sanitizedKey,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  try {
    await jwtClient.authorize();
    console.log(`\n   🎉 SUCESSO! AUTENTICAÇÃO FUNCIONOU!`);
    console.log(`   O token foi gerado e aceito pelo Google.`);
    console.log(
      `   Isso confirma que a chave é válida e o patch de hora funciona.`
    );
  } catch (err: any) {
    console.error(`\n   ⛔ FALHA DE AUTENTICAÇÃO:`);
    console.error(`   Erro: ${err.message}`);
    if (err.response) {
      console.error(
        `   Detalhes do Servidor: ${JSON.stringify(err.response.data, null, 2)}`
      );
    }
    console.log(`\n   VEREDICTO DE DEPURAÇÃO:`);
    if (err.message.includes("invalid_grant")) {
      console.log(`   -> O erro "invalid_grant" persiste.`);
      console.log(
        `   -> Se a hora foi ajustada e a chave sanitizada, então a chave pode ter sido REVOGADA no console do Google Cloud.`
      );
      console.log(
        `   -> AÇÃO RECOMENDADA: Gerar uma NOVA chave de Service Account no Google Cloud Console.`
      );
    }
  } finally {
    // Restore Date
    Date.now = originalDateNow;
  }

  console.log("\n==================================================");
}

runDiagnosis();
