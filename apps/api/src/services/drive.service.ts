import { google } from "googleapis";
import path from "path";
import fs from "fs";
import { env } from "../config/env";

export class DriveService {
  private static auth: any;

  private static async getAuthClient() {
    if (this.auth) return this.auth;

    // Log da data atual para o usuário
    console.log(
      `[DriveService] 🕒 Data do Sistema: ${new Date().toISOString()}`
    );

    let credentials;
    let keyFilePath = "";

    // 1. Prioriza variável de ambiente
    if (env.GOOGLE_SERVICE_ACCOUNT) {
      console.log("[DriveService] Inicializando via Variável de Ambiente");
      try {
        credentials = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT);
        if (typeof credentials === "string") {
          credentials = JSON.parse(credentials);
        }
      } catch (error: any) {
        throw new Error(
          `Erro ao parsing GOOGLE_SERVICE_ACCOUNT: ${error.message}`
        );
      }
    } else {
      // 2. Fallback: Arquivo Local
      const possiblePaths = [
        path.join(process.cwd(), "service-account.json"),
        path.join(process.cwd(), "apps/api/service-account.json"),
        path.join(__dirname, "../../service-account.json"),
        path.join(__dirname, "../../../service-account.json"),
      ];

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          keyFilePath = p;
          break;
        }
      }

      if (!keyFilePath) {
        throw new Error("Service Account não encontrada.");
      }

      console.log(`[DriveService] Lendo credenciais de: ${keyFilePath}`);
      const content = fs.readFileSync(keyFilePath, "utf8");
      credentials = JSON.parse(content);
    }

    // --- SANITIZAÇÃO AGRESSIVA DA CHAVE (CRUCIAL PARA WINDOWS) ---
    // Remove carriage returns (\r) e converte literais de \n para quebras de linha reais
    const rawKey = credentials.private_key || "";
    const sanitizedKey = rawKey.replace(/\\n/g, "\n").replace(/\r/g, "").trim();

    console.log("[DriveService] 🔑 Chave sanitizada.");

    // --- CORREÇÃO DE DECASAMENTO DE RELÓGIO (CLOCK SKEW) ---
    // Se o relógio local estiver adiantado em relação ao Google (mesmo que milissegundos),
    // o token é rejeitado (iat no futuro). Voltamos 5 minutos para garantir.
    const OriginalDate = global.Date;
    class TimeTravelDate extends OriginalDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          // Return explicitly now - 5 minutes
          super(new OriginalDate().getTime() - 5 * 60 * 1000);
        } else {
          // @ts-ignore
          super(...args);
        }
      }
      static now() {
        return new OriginalDate().getTime() - 5 * 60 * 1000;
      }
    }
    // @ts-ignore
    global.Date = TimeTravelDate;

    // Log para confirmar que a hora "baixou" 5 minutos
    console.log(
      `[DriveService] 🕒 Hora Ajustada para Token (Skew -5min): ${new Date().toISOString()}`
    );

    // Usamos JWT Client diretamente para controle total
    // Utilizando sintaxe de objeto para compatibilidade com versões novas da lib
    const jwtClient = new google.auth.JWT({
      email: credentials.client_email,
      key: sanitizedKey,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    try {
      // Força a verificação da autorização agora (fail-fast)
      await jwtClient.authorize();
      console.log("✅ [DriveService] Autorização JWT realizada com sucesso.");
    } catch (err: any) {
      console.error(
        "❌ [DriveService] Erro crítico ao autorizar JWT:",
        err.message
      );
      throw err;
    } finally {
      // Restaura a data original IMEDIATAMENTE
      global.Date = OriginalDate;
    }

    this.auth = jwtClient;
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
