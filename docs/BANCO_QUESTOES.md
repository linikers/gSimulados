# 📚 Módulo Banco de Questões - Documentação Completa

## Visão Geral

Sistema para gerenciar questões extraídas de PDFs do Google Drive usando GPT-4 Vision.

## Arquitetura

### Fluxo Completo

```
1. Configurar Google Drive → Vincular pasta do Drive a um vestibular
2. Sincronizar PDFs → Listar PDFs disponíveis na pasta
3. Extrair Questões → Processar PDF com GPT-4 Vision
4. Revisar Questões → Aprovar/Rejeitar questões extraídas
5. Banco de Questões → Questões aprovadas vão para o banco principal
```

---

## Backend

### Models

#### `DriveConfig`

Configuração de pastas do Google Drive por vestibular.

```typescript
{
  vestibularCodigo: string,      // "uem", "enem", etc
  googleDriveFolderId: string,   // ID da pasta no Drive
  folderName: string,            // Nome amigável
  folderUrl: string,             // URL completa
  lastSync: Date,                // Última sincronização
  totalPdfs: number,             // Total de PDFs encontrados
  totalQuestoesExtraidas: number,
  ativo: boolean
}
```

#### `PdfSource`

PDFs disponíveis para extração.

```typescript
{
  driveConfigId: ObjectId,
  vestibularCodigo: string,
  driveFileId: string,           // ID do arquivo no Drive
  fileName: string,
  fileSize: number,
  webViewLink: string,           // Link para visualizar
  status: "pending" | "processing" | "completed" | "error",
  totalPaginas: number,
  questoesExtraidas: number,
  processedAt: Date
}
```

#### `ExtractedQuestion`

Questões extraídas aguardando revisão.

```typescript
{
  pdfSourceId: ObjectId,
  vestibularCodigo: string,
  pageNumber: number,

  // Dados extraídos
  rawText: string,
  enunciado: string,
  alternativas: string[],
  respostaCorreta: "A" | "B" | "C" | "D" | "E",

  // Metadados sugeridos pela IA
  materia: string,
  assunto: string,
  dificuldade: "facil" | "medio" | "dificil",

  // Qualidade
  confidence: number,            // 0-100
  temImagem: boolean,
  temFormula: boolean,

  // Revisão
  status: "pending" | "approved" | "rejected",
  reviewedBy: ObjectId,
  reviewNotes: string,
  questionId: ObjectId           // Referência à questão final
}
```

### Endpoints

#### Drive Config

```
GET    /drive-config              - Listar configurações
GET    /drive-config/:codigo      - Config por vestibular
POST   /drive-config              - Criar/Atualizar
POST   /drive-config/:codigo/sync - Sincronizar PDFs do Drive
DELETE /drive-config/:codigo      - Remover configuração
```

#### Extraction

```
GET    /extraction/pdfs           - Listar PDFs (filtros: vestibularCodigo, status)
POST   /extraction/pdfs/:id/extract - Extrair questões de um PDF
GET    /extraction/stats          - Estatísticas gerais
```

---

## Frontend

### Páginas

#### 1. Configurar Drive (`/admin/banco-questoes/drive`)

- Formulário para vincular pasta do Drive
- Lista de pastas configuradas
- Botão de sincronização manual

#### 2. PDFs Disponíveis (`/admin/banco-questoes/pdfs`)

- Tabela com todos os PDFs
- Filtros por vestibular e status
- Botão "Extrair" para processar PDF

#### 3. Revisar Questões (`/admin/banco-questoes/revisar`)

- Lista de questões pendentes
- Editor inline para correções
- Aprovar/Rejeitar

### Services

#### `DriveConfigService`

```typescript
list(); // Listar configs
getByVestibular(codigo); // Config específica
upsert(data); // Criar/Atualizar
syncPdfs(codigo); // Sincronizar
delete codigo; // Remover
```

#### `PdfExtractionService`

```typescript
listPdfs(vestibular?, status?)  // Listar PDFs
extractFromPdf(id)              // Extrair questões
getStats()                      // Estatísticas
```

---

## Workflow de Uso

### 1. Configurar Google Drive

**Admin acessa:** `/admin/banco-questoes/drive`

1. Seleciona vestibular (ex: UEM)
2. Cola URL da pasta do Drive
3. Extrai ID automaticamente
4. Salva configuração

### 2. Sincronizar PDFs

**Na mesma tela:**

1. Clica em "Sincronizar" na pasta configurada
2. Sistema busca PDFs na pasta do Drive
3. Cria registros em `PdfSource`
4. Atualiza contagem

### 3. Extrair Questões

**Admin acessa:** `/admin/banco-questoes/pdfs`

1. Vê lista de PDFs disponíveis
2. Clica em "Extrair" no PDF desejado
3. Sistema:
   - Baixa PDF do Drive
   - Converte páginas em imagens
   - Envia para GPT-4 Vision
   - Cria registros em `ExtractedQuestion`
4. Status muda para "Concluído"

### 4. Revisar Questões

**Admin acessa:** `/admin/banco-questoes/revisar`

1. Vê questões pendentes
2. Para cada questão:
   - Revisa enunciado
   - Corrige alternativas se necessário
   - Confirma resposta correta
   - Ajusta metadados (matéria, assunto)
3. Aprova ou rejeita
4. Questões aprovadas → Banco principal (`Question`)

---

## Integração com Google Drive API

### Setup (Futuro)

1. **Criar Projeto no Google Cloud**

   - Habilitar Google Drive API
   - Criar credenciais OAuth 2.0

2. **Configurar Variáveis de Ambiente**

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
```

3. **Instalar Dependências**

```bash
yarn add googleapis google-auth-library
```

### Implementação Real (Substituir Mock)

```typescript
// services/google-drive.service.ts
import { google } from "googleapis";

export async function listFilesInFolder(folderId: string) {
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/pdf'`,
    fields: "files(id, name, size, webViewLink, createdTime)",
  });

  return response.data.files;
}
```

---

## Integração com GPT-4 Vision

### Implementação Real (Substituir Mock)

Ver `docs/GPT4_VISION_INTEGRATION.md` para detalhes completos.

**Resumo:**

```typescript
// controllers/pdf-extraction.controller.ts
import { convertPdfToImages } from "../services/pdf-to-images.service";
import { extractQuestionsFromImage } from "../services/gpt-vision.service";

// 1. Baixar PDF do Drive
// 2. Converter páginas em imagens
const images = await convertPdfToImages(pdfPath);

// 3. Processar cada página
for (const imagePath of images) {
  const { questoes } = await extractQuestionsFromImage(imagePath);
  await ExtractedQuestion.insertMany(questoes);
}
```

---

## Rotas do Frontend

Adicionar em `App.tsx`:

```typescript
// Banco de Questões (Admin)
<Route path="/admin/banco-questoes/drive" element={<ConfigurarDrive />} />
<Route path="/admin/banco-questoes/pdfs" element={<ListaPdfs />} />
<Route path="/admin/banco-questoes/revisar" element={<RevisarQuestoes />} />
```

Adicionar em `navigation.ts`:

```typescript
{
  title: "Banco de Questões",
  path: "/admin/banco-questoes/drive",
  icon: FolderIcon,
},
```

---

## Próximos Passos

### Fase 1: MVP (Atual)

- ✅ Models e Controllers
- ✅ Rotas backend
- ✅ Services frontend
- ✅ Páginas de configuração e listagem
- ⏳ Página de revisão

### Fase 2: Integração Real

- [ ] Google Drive API (substituir mock)
- [ ] GPT-4 Vision (substituir mock)
- [ ] Conversão PDF → Imagens

### Fase 3: Melhorias

- [ ] Processamento em background (Queue)
- [ ] Notificações em tempo real
- [ ] Histórico de extrações
- [ ] Métricas de qualidade

---

## Troubleshooting

### "Nenhum PDF encontrado"

- Verifique se configurou pasta do Drive
- Clique em "Sincronizar" para buscar PDFs

### "Erro ao extrair questões"

- Verifique logs do backend
- Confirme que GPT-4 Vision está configurado
- Verifique formato do PDF (deve ser legível)

### "Questões com baixa confiança"

- Normal para PDFs com muitas imagens
- Revise manualmente antes de aprovar
- Considere melhorar qualidade do PDF original
