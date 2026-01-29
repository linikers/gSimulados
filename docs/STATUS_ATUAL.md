# Status Atual do Sistema - gSimulados

**Data de Atualização:** 29/01/2026

## ✅ O que está funcionando (Implementado)

### 1. Banco de Questões (Fluxo Automatizado com IA)
O sistema possui um fluxo completo de ingestão de questões via PDFs, utilizando Google Drive e Google Gemini AI.

**Fluxo de Dados:**
1.  **Configuração do Drive (`/admin/banco-questoes/drive`)**:
    - O admin configura uma pasta do Google Drive vinculada a um Vestibular (ex: ENEM).
    - O Backend conecta via Service Account (Google Drive API).
2.  **Sincronização (`/admin/banco-questoes/pdfs`)**:
    - O sistema lista os PDFs da pasta configurada.
    - Metadados dos arquivos são salvos no banco local (`PdfSource`).
3.  **Extração com IA (`Botão "Extrair Conhecimento"`)**:
    - O backend baixa o PDF do Drive (stream em memória).
    - O arquivo é enviado para o **Google Gemini 1.5 Flash**.
    - O prompt instrui a IA a extrair Enunciado, Alternativas, Gabarito e Metadados em formato JSON.
    - **Status:** Implementado e funcional (`gemini-vision.service.ts`).
4.  **Auditoria Acadêmica (`GeminiAuditService`)**:
    - Novo serviço que atua como Professor Revisor.
    - Valida clareza, precisão técnica e corrige gabaritos ausentes ou errados.
    - Registra logs detalhados em `AuditLog` para rastreabilidade.
5.  **Revisão e Aprovação (`/admin/banco-questoes/revisar`)**:
    - As questões extraídas entram como "Pendentes".
    - O Admin revisa, ajusta texto/gabarito e aprova.
    - Ao aprovar, a questão é movida para o Banco de Questões oficial (`Question` collection).

### 2. Gestão de Escolas e Alunos (Multi-tenancy)
- Cadastros de Escolas e Alunos funcionais.
- Associação de Alunos a Escolas.
- Controle de acesso baseado em Roles (Admin, Escola, Aluno).

### 3. Simulados (Aluno)
- Aluno pode gerar simulados personalizados (por Matéria/Assunto).
- Histórico de simulados realizados.
- Visualização de resultados.

---

## 🚧 O que ainda não foi feito / Pontos de Atenção (Gaps)

### 1. Frontend - Detalhes de UI/UX
- A tela de **Revisão de Questões** precisa de testes de usabilidade intensos (edição de fórmulas LaTeX, imagens).
- Tratamento de erros no frontend para falhas de extração da IA (ex: timeout, JSON inválido) pode ser melhorado.

### 2. Extração de Imagens das Questões
- **Situação:** O Gemini identifica que "temImagem: true", mas o recorte da imagem e upload para Cloudinary ainda não parece estar 100% automatizado no fluxo principal de extração massiva.
- **Necessidade:** Verificar se as imagens estão sendo salvas corretamente ou se dependem de upload manual na revisão.

### 3. Dashboard Analítico
- O Dashboard principal (`/dashboard`) exibe apenas dados básicos do usuário. Faltam gráficos de desempenho e métricas gerais.

---

## 🗺️ Mapa de Rotas e Serviços Atuais

### Integrações Externas Ativas
- **Google Drive API**: Leitura de PDFs.
- **Google Gemini AI**: Processamento de Texto/Visão dos PDFs.
- **MongoDB**: Banco de dados principal.

### Estrutura de Pastas (Relevante para Manutenção)
- `apps/api/src/services/drive.service.ts`: Lógica de conexão com Drive (inclui correção de clock skew).
- `apps/api/src/services/gemini-vision.service.ts`: Prompt e chamada à IA.
- `apps/web/src/pages/admin/BancoQuestoes`: Telas do fluxo de ingestão.
