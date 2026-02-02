# Especificação Técnica: Dashboard Analítico (Futuro)

Este documento define os requisitos e a lógica técnica para a implementação do Dashboard principal do `gSimulados`, com foco especial em métricas de Inteligência Artificial.

## 1. Métricas de IA (Precisão e Performance)

Graças ao sistema de `AuditLog` e `ExtractedQuestion` implementado, podemos calcular métricas reais de qualidade.

### A. Taxa de Assertividade da IA (Accuracy Rate)
- **Objetivo**: Medir quão "perfeita" é a extração original do Gemini.
- **Cálculo**: `1 - (Correções Manuais / Total de Aprovações)`.
- **Lógica MongoDB**: 
  - Contar documentos em `auditlogs` com `action: "manual_correction"`.
  - Comparar com o total de documentos em `extractedquestions` com `status: "approved"`.
- **Visualização**: Gráfico de "Gauge" ou Percentual em destaque.

### B. Distribuição de Erros por Categoria
- **Objetivo**: Identificar se a IA erra mais em Textos, Gabaritos ou Matérias.
- **Lógica**: Agrupar logs de `manual_correction` verificando quais chaves no campo `details.newValue` são diferentes do `details.previousValue`.
- **Visualização**: Gráfico de Pizza (Donut Chart).

### C. Nível de Confiança Médio
- **Objetivo**: Acompanhar o `confidence score` retornado pela API.
- **Lógica**: Média simples do campo `confidence` na coleção `ExtractedQuestion`.
- **Visualização**: Gráfico de Linha (Timeline) para ver se a confiança cai com PDFs mais complexos.

## 2. Métricas de Operação (Volume e Status)

### A. Funil de Ingestão
- **Total de PDFs Sincronizados** (PdfSources).
- **Total de Questões Extraídas** (Pendente de Revisão).
- **Total de Questões Aprovadas** (No Banco Oficial).
- **Visualização**: Gráfico de Funil ou Cards de Status.

### B. Produtividade Humana
- **Aprovações por Usuário**: Quantas questões cada admin revisou.
- **Tempo Médio de Revisão**: Cálculo entre `createdAt` e `reviewedAt` (opcional).

## 3. Arquitetura de Implementação

### Backend (`apps/api`)
- **Novo Endpoint**: `GET /api/admin/dashboard/stats`.
- **Pipeline de Agregação**: Utilizar `.aggregate()` do Mongoose para processar os dados no próprio banco, evitando trafegar milhares de logs pela rede.

### Frontend (`apps/web`)
- **Página**: `/admin/dashboard`.
- **Componentes**:
  - `SummaryCard`: Valor grande + ícone + variação percentual.
  - `ApexCharts` ou `Recharts`: Biblioteca recomendada para os gráficos.
  - `DataGrid`: Para listar as últimas correções manuais importantes.

---

## 📅 Roadmap de Implementação Sugerido

1. **Sprint 1**: Backend Aggregations (Stats Básicas + IA Accuracy).
2. **Sprint 2**: UI Layout com Cards e Gráficos de Pizza.
3. **Sprint 3**: Filtros por data e vestibular (ex: Ver precisão da IA apenas no ENEM).
