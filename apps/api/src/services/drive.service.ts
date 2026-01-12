import { google } from "googleapis";
import path from "path";
import fs from "fs";
import { env } from "../config/env";

// --- PATCH REMOVIDO: Causou conflito com Mongoose ---
// Vamos tentar uma abordagem local apenas no JWT
// ------------------------------------------------
// ------------------------------------------------

export class DriveService {
  private static auth: any;

  private static async getAuthClient() {
    if (this.auth) return this.auth;

    let credentials;
    let keyFilePath = "";

    // 1. Prioriza variável de ambiente (recomendado para Fly.io/Produção)
    if (env.GOOGLE_SERVICE_ACCOUNT) {
      console.log(
        "[DriveService] Usando credenciais da variável de ambiente GOOGLE_SERVICE_ACCOUNT"
      );
      try {
        credentials = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT);
        if (typeof credentials === "string") {
          console.log(
            "[DriveService] GOOGLE_SERVICE_ACCOUNT estava com aspas extras, parseando novamente..."
          );
          credentials = JSON.parse(credentials);
        }
      } catch (error: any) {
        throw new Error(
          `Erro ao parsear GOOGLE_SERVICE_ACCOUNT: ${error.message}`
        );
      }
    } else {
      // 2. Fallback para arquivo local (Desenvolvimento)
      const possiblePaths = [
        path.join(process.cwd(), "service-account.json"),
        path.join(process.cwd(), "apps/api/service-account.json"),
        path.join(__dirname, "../../service-account.json"),
        path.join(__dirname, "../../../service-account.json"),
      ];

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          keyFilePath = p;
          console.log(`[DriveService] Usando credenciais de: ${keyFilePath}`);
          break;
        }
      }

      if (!keyFilePath) {
        throw new Error(
          "Credenciais do Google não encontradas (variável GOOGLE_SERVICE_ACCOUNT ou arquivo service-account.json)."
        );
      }

      const content = fs.readFileSync(keyFilePath, "utf8");
      credentials = JSON.parse(content);
    }

    const sanitizedKey = credentials.private_key
      .replace(/\\n/g, "\n")
      .replace(/\r/g, "")
      .split("\n")
      .map((line: string) => line.trim())
      .join("\n")
      .trim();

    // Usar fromJSON é mais robusto pois pega todos os campos necessários (project_id, private_key_id, etc)
    this.auth = google.auth.fromJSON({
      ...credentials,
      private_key: sanitizedKey,
    });

    // É necessário setar os scopes separadamente quando usa fromJSON
    (this.auth as any).scopes = [
      "https://www.googleapis.com/auth/drive.readonly",
    ];

    // Diagnóstico detalhado
    console.log("[DriveService] Diagnóstico Detalhado:");
    console.log(`- Project ID: ${credentials.project_id}`);
    console.log(
      `- Private Key ID: ${
        credentials.private_key_id ? "Encontrado" : "NÃO ENCONTRADO"
      }`
    );
    console.log(`- Comprimento da Chave: ${sanitizedKey.length}`);
    console.log(`- Início: ${sanitizedKey.substring(0, 30)}...`);
    console.log(
      `- Fim: ...${sanitizedKey.substring(sanitizedKey.length - 30)}`
    );
    console.log(`- Email Service Account: "${credentials.client_email}"`);

    // --- PATCH DE HORA LOCALIZADO (Evita quebras no Mongoose) ---
    // Apenas forçamos a geração do token enquanto a data está "mentindo", depois restauramos.
    // --- PATCH DE HORA LOCALIZADO ---
    const OriginalDate = global.Date;

    // Verifica se estamos no futuro (2026)
    if (new OriginalDate().getFullYear() >= 2026) {
      console.log("⚠️ [DriveService] DETECÇÃO DE DATA FUTURA ATIVADA.");

      const systemDate = new OriginalDate();
      // Criamos a data ajustada apenas para o log (e para pegar a diferença correta)
      const adjustedTime = new OriginalDate(systemDate);
      adjustedTime.setFullYear(adjustedTime.getFullYear() - 1);

      console.log("[DriveService] 🕒 Comparativo de Datas:");
      console.log(
        `   🔴 Data do Sistema (Recusada pelo Google): ${systemDate.toISOString()}`
      );
      console.log(
        `   🟢 Data Ajustada (Enviada ao Google):      ${adjustedTime.toISOString()}`
      );

      class TimeTravelDate extends OriginalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            // Retorna a data atual ajustada em -1 ano
            const now = new OriginalDate();
            now.setFullYear(now.getFullYear() - 1);
            super(now.getTime());
          } else {
            // @ts-ignore
            super(...args);
          }
        }
        static now() {
          const now = new OriginalDate();
          now.setFullYear(now.getFullYear() - 1);
          return now.getTime();
        }
      }

      // 1. Substitui Date globalmente temporariamente
      // @ts-ignore
      global.Date = TimeTravelDate;

      try {
        // 2. Força a geração do Token
        await this.auth.getAccessToken();
        console.log(
          "✅ [DriveService] Token gerado com sucesso (Auth Cacheada)!"
        );
      } catch (err: any) {
        console.error("❌ [DriveService] Falha na autenticação:", err.message);
        if (err.response)
          console.error("Detalhes do erro OAuth:", err.response.data);
        throw err;
      } finally {
        // 3. Restaura Date original IMEDIATAMENTE
        global.Date = OriginalDate;
        console.log("🔄 [DriveService] Data do sistema restaurada.");
      }
    }

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
