# 🤖 GPT-4 Vision Integration - Question Extraction

## Overview

Use OpenAI's GPT-4 Vision to extract questions from PDF pages containing mathematical formulas, images, and complex formatting.

## Why GPT-4 Vision?

- ✅ Understands mathematical notation (LaTeX, symbols)
- ✅ Processes images + text in one call
- ✅ Returns structured JSON
- ✅ High accuracy for academic content

## Setup

### 1. Install Dependencies

```bash
cd apps/api
yarn add openai pdf-poppler
```

### 2. Environment Variables

Add to `apps/api/.env`:

```env
OPENAI_API_KEY=sk-proj-...
```

### 3. Get API Key

1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy to `.env`

## Implementation

### PDF to Images

```typescript
// services/pdf-to-images.service.ts
import { pdfToPng } from "pdf-poppler";

export async function convertPdfToImages(pdfPath: string) {
  const options = {
    format: "png",
    out_dir: "./temp",
    out_prefix: "page",
    page: null, // All pages
  };

  await pdfToPng(pdfPath, options);
  // Returns array of image paths
}
```

### GPT-4 Vision Call

```typescript
// services/gpt-vision.service.ts
import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractQuestionsFromImage(imagePath: string) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");

  const prompt = `
Você é um especialista em extrair questões de vestibular de imagens.

Analise esta imagem e extraia TODAS as questões encontradas.
Para cada questão, retorne um objeto JSON com:

{
  "questoes": [
    {
      "numero": 1,
      "enunciado": "texto completo da questão",
      "alternativas": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "respostaCorreta": "A" (se visível),
      "materia": "Matemática/Física/etc",
      "assunto": "Geometria/Cinemática/etc",
      "temImagem": true/false,
      "temFormula": true/false
    }
  ]
}

IMPORTANTE:
- Se houver fórmulas matemáticas, transcreva em LaTeX entre $...$
- Mantenha formatação de texto (negrito, itálico)
- Se não conseguir identificar a resposta correta, deixe null
- Se a questão tiver imagem/gráfico, marque temImagem: true
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${base64Image}`,
              detail: "high", // Better quality for formulas
            },
          },
        ],
      },
    ],
    max_tokens: 4096,
    temperature: 0.1, // Low temperature for accuracy
  });

  const result = response.choices[0].message.content;
  return JSON.parse(result);
}
```

### Complete Workflow

```typescript
// controllers/extraction.controller.ts
export class ExtractionController {
  static async extractFromPdf(req: Request, res: Response) {
    try {
      const pdfPath = req.file.path; // Uploaded PDF

      // 1. Convert PDF to images
      const imagePaths = await convertPdfToImages(pdfPath);

      // 2. Process each page
      const allQuestions = [];
      for (const imagePath of imagePaths) {
        const { questoes } = await extractQuestionsFromImage(imagePath);
        allQuestions.push(...questoes);
      }

      // 3. Save to ExtractedQuestion collection
      const extracted = await ExtractedQuestion.insertMany(
        allQuestions.map((q) => ({
          ...q,
          status: "pending",
          sourcePdf: {
            fileName: req.file.originalname,
            uploadedAt: new Date(),
          },
        }))
      );

      res.json({
        message: `${extracted.length} questões extraídas`,
        questions: extracted,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

## Cost Estimation

### GPT-4 Vision Pricing (as of Dec 2024)

- **Input**: $0.01 per image (1024x1024)
- **Output**: $0.03 per 1K tokens

### Example Calculation

- PDF with 50 pages
- Each page = 1 image
- Average 2 questions per page = 100 questions total

**Cost:**

- Images: 50 × $0.01 = **$0.50**
- Output: ~50K tokens × $0.03/1K = **$1.50**
- **Total: ~$2.00 per PDF**

## Optimization Tips

### 1. Batch Processing

Process multiple pages in parallel:

```typescript
const results = await Promise.all(
  imagePaths.map((path) => extractQuestionsFromImage(path))
);
```

### 2. Caching

Store extracted questions to avoid re-processing:

```typescript
const cached = await ExtractedQuestion.findOne({
  "sourcePdf.fileName": fileName,
});
if (cached) return cached;
```

### 3. Image Quality

Use lower resolution for simple text:

```typescript
image_url: {
  url: base64Image,
  detail: "low" // Cheaper, good for text-only
}
```

## Error Handling

### Common Issues

1. **Invalid JSON Response**

   - Add JSON schema validation
   - Retry with adjusted prompt

2. **Rate Limits**

   - OpenAI: 500 requests/min
   - Add queue system for large batches

3. **Formula Recognition Errors**
   - Review extracted formulas manually
   - Flag low-confidence extractions

## Alternative: Gemini Vision (Google)

If cost is a concern, consider Google's Gemini:

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

// Similar API, potentially lower cost
```

## Next Steps

1. Setup OpenAI account and get API key
2. Test with sample PDF
3. Implement review interface
4. Add approval workflow
