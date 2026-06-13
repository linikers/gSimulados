# PIT — Projeto de Investimento Técnico
## gSimulados — Plataforma Inteligente de Simulados para Vestibulares

---

## 1. Resumo Executivo

O **gSimulados** é uma plataforma SaaS que automatiza a criação de simulados para vestibulares usando Inteligência Artificial (Google Gemini + OpenAI). Professores e escolas cadastram seus alunos, e o sistema extrai questões diretamente de PDFs de provas anteriores, gera simulados personalizados por matéria/assunto, e fornece relatórios de desempenho.

**Problema que resolve:** Professores gastam horas montando provas manualmente. Alunos não têm acesso a simulados personalizados com correção automática e análise de desempenho.

**Solução:** Plataforma completa com banco de questões alimentado por IA, geração automatizada de simulados, correção automática, e dashboards de desempenho para alunos, professores e escolas.

---

## 2. O Produto

### 2.1 Funcionalidades Implementadas
- ✅ Extração de questões de PDFs via IA (Google Gemini)
- ✅ Auditoria acadêmica com IA
- ✅ Banco de questões com revisão humana (human-in-the-loop)
- ✅ Cadastro de escolas e alunos (multi-tenancy)
- ✅ Geração de simulados personalizados
- ✅ Correção automática e histórico de resultados
- ✅ Autenticação e controle de acesso (Admin, Escola, Aluno)
- ✅ Integração com Google Drive

### 2.2 Funcionalidades em Desenvolvimento
- 🔄 Dashboard analítico com gráficos de desempenho
- 🔄 Editor LaTeX para fórmulas matemáticas
- 🔄 Gamificação (conquistas e progresso)
- 🔄 Filas de processamento (Redis/BullMQ) para escala

### 2.3 Roadmap Futuro
- App Mobile (React Native)
- Integração OneDrive/Dropbox
- Marketplace de questões entre professores
- Sistema de mentoria e aulas gravadas

---

## 3. Modelo de Negócio

### 3.1 Público-Alvo
- Escolas particulares (Ensino Médio e Pré-Vestibular)
- Cursinhos populares e preparatórios
- Professores autônomos
- Alunos individuais (assinatura direta)

### 3.2 Planos de Precificação (Sugerida)

| Plano | Público | Preço Mensal | Alunos |
|-------|---------|-------------|--------|
| **Free** | Aluno individual | Grátis | 1 aluno, 3 simulados/mês |
| **Individual** | Aluno | R$ 19,90 | 1 aluno, ilimitado |
| **Escola Small** | Escola (até 100 alunos) | R$ 497 | Até 100 alunos |
| **Escola Medium** | Escola (até 500 alunos) | R$ 1.497 | Até 500 alunos |
| **Escola Large** | Escola (até 2.000 alunos) | R$ 3.997 | Até 2.000 alunos |
| **Enterprise** | Redes de ensino | Sob consulta | Ilimitado |

### 3.3 Projeção de Receita (10.000 Alunos)

Considerando uma distribuição realista:

| Segmento | Alunos | % | Faturamento |
|----------|--------|---|-------------|
| Individual (R$19,90) | 2.000 | 20% | R$ 39.800 |
| Escola Small (R$497) | 20 escolas (~2.000 alunos) | 20% | R$ 9.940 |
| Escola Medium (R$1.497) | 8 escolas (~4.000 alunos) | 40% | R$ 11.976 |
| Escola Large (R$3.997) | 1 escola (~2.000 alunos) | 20% | R$ 3.997 |
| **Total** | **10.000 alunos** | **100%** | **R$ 65.713/mês** |

**Receita anual estimada: ~R$ 788.556**

---

## 4. Custos de Infraestrutura (10.000 Alunos Ativos)

### 4.1 Hospedagem e Banco de Dados

| Item | Especificação | Custo Mensal |
|------|--------------|-------------|
| **Banco de Dados MongoDB Atlas (M40)** | 16GB RAM, 200GB storage, Dedicated | ~$370 (~R$ 2.035) |
| **Aplicação Backend (2 instâncias)** | 2x 4GB RAM, 2 vCPU cada (Fly.io ou Railway) | ~$100 (~R$ 550) |
| **Frontend (Vercel Pro)** | Banda ilimitada, equipe | ~$20 (~R$ 110) |
| **Redis (Upstash + BullMQ)** | Filas de processamento assíncrono | ~$30 (~R$ 165) |
| **CDN/Storage (Cloudinary)** | Imagens das questões | ~$50 (~R$ 275) |
| **Domínio + SSL** | - | ~$10 (~R$ 55) |
| **Monitoramento (Sentry + Grafana)** | APM e logs | ~$50 (~R$ 275) |
| **Subtotal Infraestrutura** | | **~$630 (~R$ 3.465)** |

### 4.2 Custos de IA

| Item | Estimativa de Uso | Custo Mensal |
|------|-------------------|-------------|
| **Gemini 1.5 Flash API** | ~10 PDFs/dia (extração) + auditoria | ~$50 (~R$ 275) |
| **OpenAI API (fallback)** | ~5% das requisições | ~$20 (~R$ 110) |
| **Subtotal IA** | | **~$70 (~R$ 385)** |

### 4.3 Total de Infraestrutura

| Item | Mensal | Anual |
|------|--------|-------|
| Infraestrutura + IA | ~R$ 3.850 | ~R$ 46.200 |

---

## 5. Equipe e Custos Operacionais (Mínimo Viável)

### 5.1 Equipe Core (Primeiros 12 meses)

| Função | Dedicação | Custo Mensal |
|--------|-----------|-------------|
| **CTO / Desenvolvedor Full-Stack** | Tempo integral | R$ 12.000 |
| **UX/UI Designer** | Meio período (20h/sem) | R$ 4.000 |
| **Suporte / CS** | Meio período | R$ 2.500 |
| **Marketing Digital** | Tempo integral | R$ 5.000 |
| **Subtotal Equipe** | | **R$ 23.500** |

### 5.2 Custos Fixos Operacionais

| Item | Custo Mensal |
|------|-------------|
| Ferramentas (Notion, Slack, GitHub) | ~R$ 300 |
| Contabilidade | ~R$ 500 |
| Judicial (contratos escolares) | ~R$ 300 |
| **Subtotal Operacional** | **~R$ 1.100** |

### 5.3 Total Mensal Operacional

| Categoria | Mensal |
|-----------|--------|
| Infraestrutura | R$ 3.850 |
| Equipe | R$ 23.500 |
| Operacional | R$ 1.100 |
| **Total Mensal** | **R$ 28.450** |
| **Total Anual** | **R$ 341.400** |

---

## 6. Investimento Inicial (12 Meses)

### 6.1 CAPEX — Investimento Inicial

| Item | Valor |
|------|-------|
| **Desenvolvimento das features faltantes** (Dashboard, Gamificação, LaTeX, Filas) — 3 meses | R$ 36.000 |
| **Design System e rebranding** | R$ 8.000 |
| **Infraestrutura inicial (3 meses)** | R$ 11.550 |
| **Marketing de lançamento** | R$ 15.000 |
| **Registro de marca e LGPD** | R$ 5.000 |
| **Capital de giro (3 meses de operação)** | R$ 85.350 |
| **Reserva técnica (10%)** | R$ 16.090 |
| **Total CAPEX** | **R$ 176.990** |

### 6.2 OPEX Mensal (A partir do mês 4)

| Mês | Situação | Custo |
|-----|----------|-------|
| Mês 1-3 | Desenvolvimento + Setup | ~R$ 41.000/mês |
| Mês 4-12 | Operação plena | ~R$ 28.450/mês |
| **Total Investimento Anual** | | **~R$ 379.050** |

---

## 7. Projeção Financeira (3 Anos)

| Indicador | Ano 1 | Ano 2 | Ano 3 |
|-----------|-------|-------|-------|
| **Alunos** | 10.000 | 25.000 | 50.000 |
| **Receita Bruta** | R$ 788.556 | R$ 1.971.390 | R$ 3.942.780 |
| **Custos Operacionais** | R$ 379.050 | R$ 520.000 | R$ 720.000 |
| **Lucro Líquido** | **R$ 409.506** | **R$ 1.451.390** | **R$ 3.222.780** |
| **Margem Líquida** | 52% | 74% | 82% |

> *Observação: Ano 1 considera custo de desenvolvimento inicial (CAPEX). A partir do Ano 2 os custos são majoritariamente operacionais com margem crescente.*

---

## 8. Oferta de Investimento Sugerida

### 8.1 Valor Solicitado

| Valor | Participação | Valuation |
|-------|-------------|----------|
| **R$ 180.000** | **15%** | **R$ 1.200.000** |
| *Ou* | | |
| **R$ 300.000** | **20%** | **R$ 1.500.000** |

### 8.2 Uso dos Recursos

| Destinação | % |
|------------|---|
| Desenvolvimento técnico (features + infra) | 40% |
| Marketing e aquisição de clientes | 25% |
| Capital de giro (equipe + operação) | 25% |
| Reserva técnica | 10% |

### 8.3 Milestones com o Investimento

| Mês | Marco |
|-----|-------|
| Mês 3 | Produto completo (Dashboard, Gamificação, LaTeX) + 10 escolas piloto |
| Mês 6 | 2.000 alunos pagantes ativos |
| Mês 9 | 5.000 alunos pagantes — ponto de equilíbrio |
| Mês 12 | **10.000 alunos pagantes — break-even operacional** |
| Mês 18 | App Mobile lançado |
| Mês 24 | 25.000 alunos — receita > R$ 160k/mês |
| Mês 36 | 50.000 alunos — preparação para Série A |

---

## 9. Diferenciais Competitivos

| Diferencial | gSimulados | Concorrentes |
|-------------|-----------|-------------|
| Extração automática de PDFs com IA | ✅ Nativo | ❌ Manual |
| Banco de questões colaborativo | ✅ Sim | ❌ Fechado |
| Simulados personalizados por matéria/assunto | ✅ Sim | ⚠️ Parcial |
| Correção automática com IA | ✅ Sim | ⚠️ Parcial |
| Multi-tenancy (escolas + alunos) | ✅ Sim | ❌ Só aluno |
| Preço acessível (a partir de R$ 19,90) | ✅ Sim | ❌ Caro (R$ 50+) |
| Open Source (customizável) | ✅ Sim | ❌ Proprietário |

---

## 10. Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Concorrentes com mais capital | Média | Nicho brasileiro, preço agressivo, foco em escolas |
| Dependência de APIs de IA | Média | Fallback OpenAI, cache de resultados |
| Baixa adesão de escolas | Média | Modelo freemium + período de teste gratuito |
| Custo de aquisição de cliente alto | Alta | Marketing de conteúdo + parceria com cursinhos |
| Complexidade técnica (LaTeX, imagens) | Baixa | IA já lida bem com imagens, LaTeX é incremental |

---

## 11. Tecnologia

| Componente | Stack |
|-----------|-------|
| **Frontend** | React 19 + Vite + Material-UI 7 |
| **Backend** | Node.js + Express 5 + TypeScript |
| **Banco de Dados** | MongoDB (Mongoose 9) |
| **IA** | Google Gemini 1.5 Flash + OpenAI GPT-4 |
| **Infraestrutura** | Fly.io / Railway / Vercel |
| **Filas** | Redis + BullMQ (planejado) |
| **Armazenamento** | Cloudinary + Google Drive |
| **Autenticação** | JWT + Bcrypt |

---

## 12. Contato

**Projeto:** gSimulados
**Repositório:** github.com/linikers/gSimulados
**Stack:** TypeScript Full-stack (React + Node.js + MongoDB + IA)

---

*Documento gerado em junho de 2026. Valores em Real (R$) baseados em custos de Jun/2026.*
