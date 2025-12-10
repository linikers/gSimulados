# 🚀 Plano de Implementação: Sistema de Extração de Questões com IA

## 📊 Visão Geral do Sistema

### Armazenamento de Dados

| Tipo de Dado             | Onde Armazenar | Por quê                                            |
| ------------------------ | -------------- | -------------------------------------------------- |
| **Questões (texto)**     | MongoDB        | Rápido, estruturado, fácil busca                   |
| **Imagens das questões** | Cloudinary     | CDN global, otimização automática, grátis até 25GB |
| **PDFs originais**       | Google Drive   | Já estão lá, não precisa duplicar                  |
| **Metadados**            | MongoDB        | Referências, status, timestamps                    |

### Custos Estimados

- **MongoDB Atlas:** Grátis (512MB)
- **Cloudinary:** Grátis (25GB, 25k transformações/mês)
- **Google Drive API:** Grátis (1 bilhão requisições/dia)
- **Gemini Vision:** Grátis (1500 requisições/dia)

**Total:** R$ 0,00/mês 🎉

---

## 📋 Etapas de Implementação

### FASE 1: Configuração Inicial (1-2 horas)

#### ✅ Etapa 1.1: Configurar Cloudinary

**Objetivo:** Criar conta e obter credenciais

1. Acesse: https://cloudinary.com/users/register_free
2. Crie conta gratuita
3. No Dashboard, copie:

   - **Cloud Name:** `seu-cloud-name`
   - **API Key:** `123456789012345`
   - **API Secret:** `abcdefghijklmnopqrstuvwxyz`

4. Adicione ao `.env`:

```env
# apps/api/.env
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

5. Instale SDK:

```bash
cd apps/api
yarn add cloudinary
```

#### ✅ Etapa 1.2: Configurar Gemini Vision (Grátis)

**Objetivo:** Obter API key do Google AI Studio

1. Acesse: https://aistudio.google.com/app/apikey
2. Clique em **"Create API Key"**
3. Copie a chave: `AIzaSy...`

4. Adicione ao `.env`:

```env
# apps/api/.env
GEMINI_API_KEY=AIzaSy...
```

5. Instale SDK:

```bash
cd apps/api
yarn add @google/generative-ai
```

#### ✅ Etapa 1.3: Instalar Dependências para PDFs

```bash
cd apps/api
yarn add pdf-parse pdf-lib sharp
```

---

### FASE 2: Backend - Serviços (3-4 horas)

#### ✅ Etapa 2.1: Criar Cloudinary Service

**Arquivo:** `apps/api/src/services/cloudinary.service.ts`

```typescript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  imageBuffer: Buffer,
  folder: string,
  publicId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `gsimulados/${folder}`,
          public_id: publicId,
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        }
      )
      .end(imageBuffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
```

#### ✅ Etapa 2.2: Criar PDF Processing Service

**Arquivo:** `apps/api/src/services/pdf-processing.service.ts`

```typescript
import pdf from "pdf-parse";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

export async function convertPdfToImages(
  pdfBuffer: Buffer
): Promise<{ pageNumber: number; imageBuffer: Buffer }[]> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pageCount = pdfDoc.getPageCount();
  const images: { pageNumber: number; imageBuffer: Buffer }[] = [];

  for (let i = 0; i < pageCount; i++) {
    // Extrair página como imagem
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();

    // Renderizar página (usando biblioteca auxiliar)
    // TODO: Implementar renderização real
    // Por enquanto, placeholder

    const imageBuffer = Buffer.from("placeholder");
    images.push({ pageNumber: i + 1, imageBuffer });
  }

  return images;
}

export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  const data = await pdf(pdfBuffer);
  return data.text;
}
```

#### ✅ Etapa 2.3: Criar Gemini Vision Service

**Arquivo:** `apps/api/src/services/gemini-vision.service.ts`

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractQuestionsFromImage(
  imageBuffer: Buffer,
  vestibularCodigo: string
): Promise<{
  questoes: Array<{
    enunciado: string;
    alternativas: string[];
    respostaCorreta?: string;
    materia?: string;
    assunto?: string;
    temImagem: boolean;
    imagemUrl?: string;
  }>;
  confidence: number;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
Você é um especialista em extrair questões de provas de vestibular ${vestibularCodigo.toUpperCase()}.

TAREFA: Extraia TODAS as questões desta imagem de prova.

REGRAS:
1. Identifique o enunciado completo de cada questão
2. Liste TODAS as 5 alternativas (A, B, C, D, E)
3. Se houver gabarito visível, identifique a resposta correta
4. Classifique a matéria (Matemática, Física, Química, etc)
5. Identifique o assunto específico (ex: Derivadas, Cinemática)
6. Se a questão contém imagem/gráfico/tabela, marque "temImagem": true

IMPORTANTE:
- Se houver imagem na questão, descreva-a brevemente no enunciado
- Mantenha formatação matemática (use LaTeX se necessário)
- Preserve símbolos e fórmulas

RETORNE JSON ARRAY:
{
  "questoes": [
    {
      "enunciado": "Texto completo da questão...",
      "alternativas": [
        "A) Primeira alternativa",
        "B) Segunda alternativa",
        "C) Terceira alternativa",
        "D) Quarta alternativa",
        "E) Quinta alternativa"
      ],
      "respostaCorreta": "A",
      "materia": "Matemática",
      "assunto": "Geometria Analítica",
      "temImagem": true
    }
  ]
}
`;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType: "image/png",
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  const text = response.text();

  // Parse JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("IA não retornou JSON válido");
  }

  const data = JSON.parse(jsonMatch[0]);

  return {
    questoes: data.questoes || [],
    confidence: 85,
  };
}
```

#### ✅ Etapa 2.4: Atualizar PDF Extraction Controller

**Arquivo:** `apps/api/src/controllers/pdf-extraction.controller.ts`

Adicionar método completo de extração com Cloudinary e Gemini.

---

### FASE 3: Atualizar Models (30 min)

#### ✅ Etapa 3.1: Adicionar Campo de Imagem

**Arquivo:** `apps/api/src/models/ExtractedQuestion.ts`

```typescript
// Adicionar campos:
imagemUrl: { type: String },
imagemPublicId: { type: String },
temImagem: { type: Boolean, default: false },
```

**Arquivo:** `apps/api/src/models/Question.ts`

```typescript
// Adicionar campos:
imagemUrl: { type: String },
temImagem: { type: Boolean, default: false },
```

---

### FASE 4: Frontend - Tela de Revisão (2-3 horas)

#### ✅ Etapa 4.1: Criar Service

**Arquivo:** `apps/web/src/services/question-review.service.ts`

```typescript
export const QuestionReviewService = {
  listPending: async () => {
    const response = await api.get("/extraction/questions/pending");
    return response.data;
  },

  approve: async (id: string, editedData: any) => {
    const response = await api.post(
      `/extraction/questions/${id}/approve`,
      editedData
    );
    return response.data;
  },

  reject: async (id: string) => {
    const response = await api.post(`/extraction/questions/${id}/reject`);
    return response.data;
  },
};
```

#### ✅ Etapa 4.2: Criar Tela de Revisão

**Arquivo:** `apps/web/src/pages/admin/BancoQuestoes/RevisarQuestoes.tsx`

Tela completa para revisar questões extraídas com suporte a imagens.

---

## ✅ Checklist de Implementação

### Configuração

- [ ] Criar conta Cloudinary
- [ ] Obter API key Gemini
- [ ] Adicionar credenciais ao `.env`
- [ ] Instalar dependências

### Backend

- [ ] Criar `cloudinary.service.ts`
- [ ] Criar `pdf-processing.service.ts`
- [ ] Criar `gemini-vision.service.ts`
- [ ] Atualizar `pdf-extraction.controller.ts`
- [ ] Adicionar campos de imagem nos models
- [ ] Criar endpoints de revisão

### Frontend

- [ ] Criar `question-review.service.ts`
- [ ] Criar `RevisarQuestoes.tsx`
- [ ] Adicionar rota no `App.tsx`
- [ ] Adicionar menu

### Testes

- [ ] Testar upload de imagem no Cloudinary
- [ ] Testar extração com Gemini Vision
- [ ] Testar fluxo completo
