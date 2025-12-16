import { google } from "googleapis";
import path from "path";
import fs from "fs";

export class DriveService {
  private static auth: any;

  private static async getAuthClient() {
    if (this.auth) return this.auth;

    // Tenta encontrar o arquivo de credenciais
    // Pode ser service-account.json ou service-acount.json (typo comum)
    const possiblePaths = [
      path.join(process.cwd(), "service-account.json"),
      path.join(process.cwd(), "apps/api/service-account.json"),
      path.join(__dirname, "../../service-account.json"),
      path.join(__dirname, "../../../service-account.json"), // Case dist/src/services
    ];

    let keyFilePath = "";
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        keyFilePath = p;
        console.log(`[DriveService] Usando credenciais de: ${keyFilePath}`);
        break;
      }
    }

    if (!keyFilePath) {
      throw new Error(
        "Arquivo de credenciais do Google (service-account.json) não encontrado na raiz da API."
      );
    }

    return new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
  }

  static async listFiles(folderId: string) {
    const auth = await this.getAuthClient();
    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/pdf' and trashed = false`,
      fields: "files(id, name, size, webViewLink, createdTime)",
      orderBy: "createdTime desc",
    });

    return response.data.files || [];
  }

  static async downloadFile(fileId: string): Promise<Buffer> {
    try {
      console.log(`[DriveService] Preparando download do arquivo: ${fileId}`);
      const auth = await this.getAuthClient();
      const drive = google.drive({ version: "v3", auth });

      console.log(`[DriveService] Solicitando stream do arquivo...`);

      // Teste: Buscar metadados primeiro para confirmar token
      await drive.files.get({ fileId, fields: "id,name" });
      console.log(
        `[DriveService] Token validado com sucesso (metadata check). Baixando conteúdo...`
      );

      const response = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "arraybuffer" }
      );
      console.log(
        `[DriveService] Resposta recebida. Status: ${response.status}`
      );

      return Buffer.from(response.data as ArrayBuffer);
    } catch (error: any) {
      console.error(
        `[DriveService] Erro ao baixar arquivo ${fileId}:`,
        error.message
      );
      // Log do erro completo se possível
      if (error.response) {
        console.error(`[DriveService] Detalhes do erro:`, error.response.data);
      }
      throw error;
    }
  }
}
