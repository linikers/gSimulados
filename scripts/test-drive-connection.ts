import { DriveService } from "../apps/api/src/services/drive.service";

// ID de uma pasta pública ou compartilhada para teste
// Substitua pelo ID que você quer testar se o argumento não for passado
const FOLDER_ID_TO_TEST =
  process.argv[2] || "1YGacJpZAYp3MKpmigGrPIeHYAY2NYJXP";

async function testConnection() {
  console.log("🔍 Iniciando teste de conexão com Google Drive...");

  try {
    if (FOLDER_ID_TO_TEST === "SUBSTITUA_PELO_SEU_FOLDER_ID_AQUI") {
      console.warn("⚠️  Aviso: Nenhum ID de pasta foi passado.");
      console.log(
        "Uso: npx ts-node scripts/test-drive-connection.ts <FOLDER_ID>"
      );
      return;
    }

    console.log(`📂 Tentando listar arquivos da pasta: ${FOLDER_ID_TO_TEST}`);
    const files = await DriveService.listFiles(FOLDER_ID_TO_TEST);

    console.log("✅ Conexão bem sucedida!");
    console.log(`📄 Arquivos encontrados: ${files.length}`);

    files.forEach((f: any) => {
      console.log(` - [${f.name}] (ID: ${f.id})`);
    });
  } catch (error: any) {
    console.error("❌ Falha na conexão:");
    console.error(error.message);
    if (error.message.includes("service-account.json")) {
      console.error(
        "Dica: Verifique se o arquivo service-account.json está na raiz de apps/api/"
      );
    }
  }
}

testConnection();
