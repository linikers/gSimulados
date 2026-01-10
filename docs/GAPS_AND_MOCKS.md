# Relatório de Gaps e Mocks (O que falta fazer?)

Este documento lista as funcionalidades que estão simuladas (Mock) e os testes que ainda precisam ser implementados.

## 🚧 Funcionalidades Mockadas (Simuladas)

Essas funcionalidades "fingem" que funcionam, mas não estão conectadas aos serviços reais.

### 1. Integração com Google Drive

- **Arquivo:** `apps/api/src/controllers/drive-config.controller.ts`
- **O que está mockado:**
  - O método `syncPdfs` retorna uma lista fixa de 3 PDFs fictícios (`mock-id-1`, etc.).
  - Não conecta na API do Google Drive para listar arquivos reais.
- **Ação Necessária:** Implementar `DriveService` usando a biblioteca `googleapis` para listar arquivos de uma pasta real.

### 2. Download de PDFs

- **Arquivo:** `apps/api/src/controllers/pdf-extraction.controller.ts`
- **O que está mockado:**
  - O método `extractFromPdf` verifica se o ID começa com `mock-` e lança erro, mas a integração com `DriveService.download` está comentada/inexistente.
  - Usa um Buffer vazio (`Buffer.from("")`) apenas para não quebrar a compilação.
- **Ação Necessária:** Implementar o download real do binário do PDF via API do Google.

### 3. Página de FAQ

- **Arquivo:** `apps/web/src/pages/public/FAQ.tsx`
- **O que está mockado:**
  - As perguntas e respostas estão escritas diretamente no código (Hardcoded).
- **Ação Necessária:** Criar uma Collection `FAQ` no MongoDB e uma rota na API para permitir que o Admin gerencie essas perguntas dinamicamente.

---

## 🧪 Testes Pendentes (Cobertura)

Testes que devem ser criados para garantir a estabilidade do sistema completo.

### 1. Extração de PDF (Crucial)

- **Tipo:** Integração (com Mocks de IA)
- **O que testar:**
  - Enviar um Buffer de PDF válido (mockado).
  - Verificar se o serviço `pdf-processing` converte em imagens.
  - Verificar se o `gemini-vision` é chamado (devemos mockar a resposta da IA para não gastar créditos/tempo).
  - Verificar se as `ExtractedQuestion` são salvas no banco.

### 2. Gestão de Alunos (Admin)

- **Tipo:** Integração
- **O que testar:**
  - Admin criando aluno (deve exigir `escolaId`).
  - Listagem de alunos (deve respeitar filtro de escola).

### 3. Integração Google Drive

- **Tipo:** Unitário/Integração
- **O que testar:**
  - Mockar a resposta da API do Google Drive.
  - Verificar se o controller cria corretamente os registros `PdfSource` no banco.
