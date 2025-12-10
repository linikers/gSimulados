# 🔐 Guia: Configurar Google Drive API (GRATUITO)

## 💰 Custos

**Google Cloud Project:** GRATUITO  
**Google Drive API:** GRATUITO  
**Limite Grátis:** 1 bilhão de requisições/dia (mais que suficiente!)

---

## 📋 Passo a Passo Completo

### 1. Criar Projeto no Google Cloud

1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Clique em **"Select a project"** (topo da página)
4. Clique em **"NEW PROJECT"**
5. Preencha:
   - **Project name:** `gSimulados`
   - **Organization:** (deixe em branco se não tiver)
6. Clique em **"CREATE"**

---

### 2. Habilitar Google Drive API

1. No menu lateral, vá em: **APIs & Services** → **Library**
2. Busque por: `Google Drive API`
3. Clique em **"Google Drive API"**
4. Clique em **"ENABLE"**

---

### 3. Criar Credenciais OAuth 2.0

#### 3.1. Configurar Tela de Consentimento

1. Vá em: **APIs & Services** → **OAuth consent screen**
2. Selecione: **External** (para uso público)
3. Clique em **"CREATE"**
4. Preencha:
   - **App name:** `gSimulados`
   - **User support email:** seu email
   - **Developer contact:** seu email
5. Clique em **"SAVE AND CONTINUE"**
6. Em **Scopes**, clique em **"ADD OR REMOVE SCOPES"**
7. Adicione:
   - `https://www.googleapis.com/auth/drive.readonly` (ler arquivos)
   - `https://www.googleapis.com/auth/drive.metadata.readonly` (ler metadados)
8. Clique em **"UPDATE"** → **"SAVE AND CONTINUE"**
9. Em **Test users**, adicione seu email
10. Clique em **"SAVE AND CONTINUE"**

#### 3.2. Criar Credenciais

1. Vá em: **APIs & Services** → **Credentials**
2. Clique em **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Selecione: **Application type:** `Web application`
4. Preencha:
   - **Name:** `gSimulados Backend`
   - **Authorized redirect URIs:**
     - `http://localhost:3001/auth/google/callback`
     - `http://localhost:3001/api/auth/google/callback`
5. Clique em **"CREATE"**

#### 3.3. Baixar Credenciais

1. Aparecerá um popup com:
   - **Client ID:** `123456789-abc123.apps.googleusercontent.com`
   - **Client Secret:** `GOCSPX-abc123xyz456`
2. **COPIE ESSES VALORES!** (você vai precisar)
3. Clique em **"DOWNLOAD JSON"** (opcional, backup)

---

### 4. Configurar no Projeto

#### 4.1. Adicionar ao `.env`

Edite `apps/api/.env`:

```env
# Google Drive API
GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz456
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
```

#### 4.2. Instalar Dependências

```bash
cd apps/api
yarn add googleapis google-auth-library
```

---

### 5. Implementar Autenticação OAuth

#### 5.1. Criar `google-auth.service.ts`

```typescript
// apps/api/src/services/google-auth.service.ts
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// URL para usuário autorizar
export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
    ],
  });
}

// Trocar código por tokens
export async function getTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

// Configurar cliente autenticado
export function getAuthenticatedClient(accessToken: string) {
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
}
```

#### 5.2. Criar Rota de Autenticação

```typescript
// apps/api/src/routes/google-auth.routes.ts
import { Router } from "express";
import { getAuthUrl, getTokens } from "../services/google-auth.service";

const router = Router();

// Redireciona para Google OAuth
router.get("/auth/google", (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

// Callback do Google
router.get("/auth/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    const tokens = await getTokens(code as string);

    // Salvar tokens no banco (associado ao usuário admin)
    // TODO: Implementar salvamento

    res.json({ success: true, tokens });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

#### 5.3. Registrar Rota

```typescript
// apps/api/src/app.ts
import googleAuthRoutes from "./routes/google-auth.routes";

app.use("/", googleAuthRoutes);
```

---

### 6. Implementar Google Drive Service

```typescript
// apps/api/src/services/google-drive.service.ts
import { google } from "googleapis";
import { getAuthenticatedClient } from "./google-auth.service";

export async function listFilesInFolder(folderId: string, accessToken: string) {
  const auth = getAuthenticatedClient(accessToken);
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/pdf'`,
    fields: "files(id, name, size, webViewLink, createdTime)",
    pageSize: 100,
  });

  return response.data.files || [];
}

export async function downloadFile(fileId: string, accessToken: string) {
  const auth = getAuthenticatedClient(accessToken);
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );

  return response.data;
}
```

---

### 7. Atualizar Controller

```typescript
// apps/api/src/controllers/drive-config.controller.ts
static async syncPdfs(req: Request, res: Response) {
  try {
    const { codigo } = req.params;

    const config = await DriveConfig.findOne({ vestibularCodigo: codigo });
    if (!config) {
      return res.status(404).json({ error: "Configuração não encontrada" });
    }

    // Buscar access token do admin (salvo anteriormente)
    const accessToken = req.user.googleAccessToken; // TODO: Implementar

    // Buscar PDFs reais do Google Drive
    const { listFilesInFolder } = require('../services/google-drive.service');
    const files = await listFilesInFolder(config.googleDriveFolderId, accessToken);

    let created = 0;
    for (const file of files) {
      const existing = await PdfSource.findOne({ driveFileId: file.id });
      if (!existing) {
        await PdfSource.create({
          driveConfigId: config._id,
          vestibularCodigo: codigo,
          driveFileId: file.id,
          fileName: file.name,
          fileSize: parseInt(file.size || '0'),
          webViewLink: file.webViewLink,
          uploadDate: new Date(file.createdTime),
        });
        created++;
      }
    }

    await DriveConfig.findByIdAndUpdate(config._id, {
      totalPdfs: await PdfSource.countDocuments({ driveConfigId: config._id }),
      lastSync: new Date(),
    });

    res.json({ message: "Sincronização concluída", created, total: files.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
```

---

## 🔄 Fluxo de Autenticação

```
1. Admin acessa: http://localhost:3001/auth/google
   ↓
2. Redireciona para Google (tela de login)
   ↓
3. Admin autoriza acesso ao Drive
   ↓
4. Google redireciona para: /auth/google/callback?code=ABC123
   ↓
5. Backend troca código por access_token
   ↓
6. Salva access_token no banco (associado ao admin)
   ↓
7. Agora pode acessar Google Drive API!
```

---

## 🎯 Próximos Passos

1. ✅ Criar projeto no Google Cloud
2. ✅ Habilitar Google Drive API
3. ✅ Criar credenciais OAuth
4. ✅ Adicionar ao `.env`
5. ⏳ Implementar autenticação OAuth
6. ⏳ Implementar Google Drive Service
7. ⏳ Testar sincronização real

---

## 🆘 Troubleshooting

### Erro: "Access blocked: This app's request is invalid"

**Solução:** Adicione seu email em **Test users** na tela de consentimento

### Erro: "redirect_uri_mismatch"

**Solução:** Verifique se a URI no código é EXATAMENTE igual à registrada no Google Cloud

### Erro: "invalid_grant"

**Solução:** Access token expirou. Implemente refresh token:

```typescript
const { tokens } = await oauth2Client.refreshAccessToken();
```

---

## 💡 Dica: Simplificar com Service Account

**Alternativa mais simples (sem OAuth):**

1. No Google Cloud: **APIs & Services** → **Credentials**
2. **CREATE CREDENTIALS** → **Service Account**
3. Baixe o JSON com as credenciais
4. Compartilhe a pasta do Drive com o email da Service Account
5. Use o JSON para autenticar:

```typescript
const auth = new google.auth.GoogleAuth({
  keyFile: "path/to/service-account.json",
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});
```

**Vantagem:** Não precisa de OAuth, mais simples!  
**Desvantagem:** Precisa compartilhar pasta manualmente
