import { DriveService } from "../src/services/drive.service";

async function run() {
  const FOLDER_ID = "1YGacJpZAYp3MKpmigGrPIeHYAY2NYJXP"; // ID da pasta do log
  const FILE_ID = "1zjeemltVTOi0M_uYfPTWfY7DxBI3RIHa"; // ID do arquivo do log

  console.log("=== Início do Teste de Debug ===");

  try {
    console.log(`\n1. Testando Listagem (listFiles) na pasta: ${FOLDER_ID}`);
    const files = await DriveService.listFiles(FOLDER_ID);
    console.log(`✅ Sucesso! Encontrados ${files.length} arquivos.`);
  } catch (error: any) {
    console.error("❌ Erro no listFiles:", error.message);
  }

  try {
    console.log(`\n2. Testando Download (downloadFile) do arquivo: ${FILE_ID}`);
    const buffer = await DriveService.downloadFile(FILE_ID);
    console.log(`✅ Sucesso! Download concluído. Bytes: ${buffer.length}`);
  } catch (error: any) {
    console.error("❌ Erro no downloadFile:", error.message);
    if (error.response) {
      console.error("Detalhes:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

run();
