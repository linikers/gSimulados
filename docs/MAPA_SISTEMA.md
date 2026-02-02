# Mapa Técnico do Sistema - gSimulados

Este documento descreve a arquitetura técnica atual do sistema `gSimulados`, focada em uma stack 100% TypeScript (Node.js/React) e integração direta com IAs Generativas.

> **Nota Histórica:** Planejamentos anteriores consideravam integrar scripts Python (`ENEM Parser`). Essa abordagem foi substituída por serviços nativos em Node.js integrados ao Google Gemini.

## 1. Arquitetura Geral

O projeto opera como um **Monorepo** (Nx/Turbo style) contendo:

*   **Frontend (`apps/web`)**: React, Vite, Material UI.
*   **Backend (`apps/api`)**: Node.js, Express, Mongoose.
*   **Banco de Dados**: MongoDB (Atlas ou Local).

---

## 2. Fluxo de Inteligência Artificial (Extração de Questões)

O "coração" da automação do sistema é o serviço de extração de questões a partir de PDFs de vestibulares.

### Componentes Envolvidos

| Componente | Função Técnica | Localização no Código |
| :--- | :--- | :--- |
| **Drive Service** | Conecta à API do Google Drive via Service Account para listar e baixar PDFs (Stream/Buffer). | `apps/api/src/services/drive.service.ts` |
| **Gemini Vision Service** | Envia o Buffer do PDF + Prompt de Contexto para a API do Google Gemini (Flash 1.5). Recebe JSON estruturado. | `apps/api/src/services/gemini-vision.service.ts` |
| **Gemini Audit Service** | Atua como Professor Revisor Acadêmico, validando questões e corrigindo gabaritos. Possui modo de resiliência (Graceful Degradation). | `apps/api/src/services/gemini-audit.service.ts` |
| **AI Diagnostics** | Script de saúde para validar conectividade e validade da chave do Gemini de forma independente. | `apps/api/test-ai.ts` |
| **PDF Extraction Controller** | Orquestra o fluxo. | `apps/api/src/controllers/pdf-extraction.controller.ts` |

### Pipeline de Dados

1.  **Ingestão**: Admin sincroniza uma pasta do Drive. O sistema salva metadados dos arquivos (`PdfSource`).
2.  **Processamento**:
    *   O Backend baixa o arquivo do Drive em memória.
    *   Envia para o Gemini (`gemini-flash-latest`) para extração.
3.  **Persistência Temporária**:
    *   O JSON retornado pela IA é salvo na coleção `ExtractedQuestion` com status `pending`.
    *   Neste ponto, o dado ainda é "cru" e pode conter erros de OCR ou alucinações.
4.  **Auditoria e Curadoria (Human-in-the-loop)**:
    *   Admin acessa interface de Revisão (`/admin/banco-questoes/revisar`).
    *   **Auditoria Manual**: Admin dispara a auditoria via botão. O sistema abre um Dialog intuitivo com o feedback da IA.
    *   Edita enunciados, corrige gabaritos e aprova.
5.  **Persistência Definitiva**:
    *   Ao aprovar, o sistema cria um documento na coleção final `Question`.

---

## 3. Modelo de Dados (Core)

### `Question` (Questão Oficial)
Entidade final utilizada para gerar simulados.

```typescript
{
  enunciado: string;      // HTML/Markdown
  alternativas: [string]; // Lista de strings (ex: ["(A) ...", "(B) ..."])
  respostaCorreta: string;// Ex: "A", "02", "Soma: 15"
  materia: string;        // Ex: "Matemática"
  assunto: string;        // Ex: "Geometria Plana"
  dificuldade: string;    // "facil", "medio", "dificil"
  origem: {
      vestibular: string; // "ENEM"
      ano: number;        // 2024
  }
}
```

### `ExtractedQuestion` (Questão em Trânsito)
Entidade intermediária que armazena o retorno da IA.

```typescript
{
  pdfSourceId: ObjectId;  // Link com o arquivo original
  confidence: number;     // Nível de confiança da IA (ex: 85)
  status: "pending" | "approved" | "rejected" | "edited";
  ...campos_da_questao
}
```

---

## 4. Integrações Externas

1.  **Google Cloud Platform**:
    *   **Drive API**: Leitura de arquivos.
    *   **Vertex AI / AI Studio**: Acesso aos modelos Gemini.
2.  **Cloudinary** (Planejado/Parcial):
    *   Armazenamento de imagens recortadas das questões.

---

## 5. Próximos Passos Técnicos

*   **Filas de Processamento**: Atualmente a extração é síncrona/request-based. Para processar centenas de PDFs, migrar para filas (BullMQ/Redis).
*   **Melhoria de Prompt**: Refinar o prompt do Gemini para identificar melhor questões com imagens e tabelas complexas.
