# Pendências Gerais e Roadmap de Implementação

Este documento centraliza as funcionalidades pendentes, refatorações necessárias e padronizações identificadas na análise do código e documentação.

**Data de Atualização:** 29/01/2026

## 1. Implementações Pendentes (Funcionalidades)

### Alta Prioridade
- [ ] **Auditoria Acadêmica com Gemini**:
    - [ ] Criar serviço `GeminiAuditService` para conferência de questões e gabaritos.
    - [ ] Implementar sistema de logs para rastreabilidade de correções da IA.
    - [ ] Integrar no fluxo de extração e geração de simulados.
- [ ] **FAQ Dinâmico**:
    - [ ] Criar Collection `FAQ` no MongoDB.
    - [ ] Criar CRUD no Backend (`FaqController`).
    - [ ] Criar tela de Admin para gerenciar perguntas.
    - [ ] Atualizar frontend público (`src/pages/public/FAQ.tsx`) para consumir da API.
- [ ] **Extração de Imagens (Questões)**:
    - [ ] Verificar pipeline de upload para Cloudinary na extração do Gemini.
    - [ ] Garantir que na revisão da questão, a imagem apareça e possa ser substituída se o recorte ficou ruim.
- [ ] **Dashboard Admin**:
    - [ ] Criar widgets com estatísticas reais (Total de Alunos, Escolas, Questões extraídas hoje, Gráficos de adesão).
    - [ ] Endpoint `/dashboard/stats` no backend.

### Média Prioridade
- [ ] **Geração Avançada de Simulados** (Baseado em `IDEIAS_AJUSTES.md`):
    - [ ] Implementar algoritmo híbrido (IA + Regras) para montagem de prova equilibrada.
    - [ ] Permitir simulados "Diagnósticos" (dificuldade progressiva).
- [ ] **Auditoria de Extração**:
    - [ ] Implementar logs detalhados de edição humana vs sugestão da IA para calcular "Taxa de Precisão da IA".

## 2. Refatoração e Padronização de Código

### Backend (`apps/api`)
- [ ] **Tratamento de Erros Centralizado**:
    - Alguns controllers usam `res.status(500).json({ error: error.message })`.
    - **Ação:** Criar um middleware global de Error Handling para não repetir try/catch em todo controller estático.
- [ ] **Validação de DTOs**:
    - Muitos endpoints pegam `req.body` direto.
    - **Ação:** Adicionar validação com `zod` ou `joi` antes de passar para o Controller/Service.
- [ ] **Hardcoded Roles**:
    - Strings como "escola", "admin" estão soltas.
    - **Ação:** Centralizar em um Enum `UserRole` no `@gsimulados/shared`.

### Frontend (`apps/web`)
- [ ] **Componentes de Tabela**:
    - `ListaEscolas` e `ListaAlunos` usam um componente `Table` genérico, o que é bom.
    - **Ação:** Verificar se todas as listagens (ex: `ListaPdfs`) estão usando esse mesmo componente para consistência visual.
- [ ] **Diálogos de Edição**:
    - Padronizar os formulários de edição (ex: `EditEscolaDialog`, `EditAlunoDialog`) para usar os mesmos hooks de form (ex: `react-hook-form` com `zod`).

## 3. Limpeza de Documentação

- [ ] **GAPS_AND_MOCKS.md**: Está desatualizado.
    - O documento alega que Drive e Extração são mocks, mas o código já implementa a lógica real (`DriveService`, `GeminiService`).
    - **Ação:** Arquivar ou atualizar drasticamente este arquivo.
- [ ] **IDEIAS_AJUSTES.md**:
    - Contém prompts valiosos.
    - **Ação:** Mover os prompts para dentro do código (ex: `apps/api/src/prompts/`) ou oficializar como especificação técnica de feature.

## 4. Testes (QA)

- [ ] **Testes de Integração**:
    - Falta cobertura crítica no fluxo: PDF Upload -> Extração -> Revisão -> Aprovação.
- [ ] **Testes de Unidade**:
    - Serviços isolados (`gemini-vision.service.ts`) precisam de testes unitários com mocks da API do Google para garantir resiliência a falhas de rede.

---

## Resumo do Status CRUD (Entidades Principais)

| Entidade | Listar (GET) | Criar (POST) | Editar (PUT) | Deletar (DELETE) | Status |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Escolas** | ✅ | ✅ | ✅ | ✅ | Completo |
| **Alunos** | ✅ | ✅ | ✅ | ✅ | Completo |
| **Vestibulares** | ✅ | ✅ | ✅ | ✅ | Completo |
| **Questões** | ✅ | ✅ (Extração) | ✅ (Revisão) | ❓ | Verificar Delete |
| **FAQ** | ❌ (Hardcoded) | ❌ | ❌ | ❌ | Pendente |
