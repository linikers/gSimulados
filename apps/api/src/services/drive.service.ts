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

    this.auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    return this.auth;
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
    const auth = await this.getAuthClient();
    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" }
    );

    return Buffer.from(response.data as ArrayBuffer);
  }
}
