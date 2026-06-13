# PIT — Projeto de Investimento Técnico (v2 - Refinado)
## gSimulados — Plataforma Inteligente de Simulados para Vestibulares

---

> **Versão refinada** — Junho 2026
> Custos reais de infraestrutura Fly.io + Hermes Agent compartilhado
> Cenário para 10.000 alunos ativos com ~100k requests/mês

---

## 1. Resumo Executivo

O **gSimulados** é uma plataforma SaaS que automatiza a criação de simulados para vestibulares usando IA (Google Gemini + OpenCode Go). Professores e escolas cadastram seus alunos, e o sistema extrai questões de PDFs, gera simulados personalizados, corrige automaticamente e fornece relatórios de desempenho — tudo integrado com **Hermes Agent** para automação de relatórios e comunicação.

### Diferencial desta versão

- Infraestrutura **realista e enxuta** com Fly.io (datacenter São Paulo)
- **Hermes Agent incluso** no mesmo servidor, sem custo extra de máquina
- **OpenCode Go** ($10/mês) como custo de LLM para o Hermes rodar
- Custos de IA dimensionados para a realidade de 100k requests/mês

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

### 2.4 Hermes Agent — Automação Inteligente

O **Hermes Agent** será o cérebro operacional da plataforma:

| Fase | O que faz | Quando |
|------|-----------|--------|
| **Fase 1 (MVP)** | Corrige simulados automaticamente + envia relatórios de desempenho para professores via WhatsApp | Lançamento |
| **Fase 2** | Envia relatórios individuais para alunos com gráficos de evolução | Mês 3-6 |
| **Fase 3** | Cria mapas de estudo personalizados com base no desempenho de cada aluno | Mês 6-9 |
| **Fase 4** | Agente de tutoria — tira dúvidas dos alunos via WhatsApp, sugere exercícios | Mês 9-12 |
| **Fase 5** | Orquestrador multi-agente — Hermes gerencia filas, dispara correções em lote, otimiza infra | Mês 12+ |

> O Hermes roda **no mesmo servidor Fly.io** que o backend, sem custo adicional de máquina. O custo é apenas os **tokens do OpenCode Go** (~$10/mês) e o processamento extra na CPU.

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

| Segmento | Alunos | % | Faturamento |
|----------|--------|---|-------------|
| Individual (R$19,90) | 2.000 | 20% | R$ 39.800 |
| Escola Small (R$497) | 20 escolas (~2.000 alunos) | 20% | R$ 9.940 |
| Escola Medium (R$1.497) | 8 escolas (~4.000 alunos) | 40% | R$ 11.976 |
| Escola Large (R$3.997) | 1 escola (~2.000 alunos) | 20% | R$ 3.997 |
| **Total** | **10.000 alunos** | **100%** | **R$ 65.713/mês** |

**Receita anual estimada: ~R$ 788.556**

---

## 4. Custos de Infraestrutura (10.000 Alunos Ativos — 100k req/mês)

### 4.1 Filosofia de Infraestrutura

Tudo roda no **Fly.io** com datacenter em **São Paulo (gru)**. O Hermes Agent compartilha a mesma máquina do backend, eliminando custo extra de servidor. Usamos máquinas **shared-cpu** (compartilhadas) — mais baratas que as performance e mais que suficientes para a carga.

### 4.2 Tabela de Custos

| Item | Especificação | Custo Mensal |
|------|--------------|-------------|
| **Backend + Hermes Agent** | 1 máquina shared-cpu-2x, 2GB RAM (Fly.io gru) | **~$11,39** (~R$ 63) |
| **MongoDB Atlas M10** | 2GB RAM, 20GB storage — suficiente para 100k req | **~$60** (~R$ 330) |
| **Gemini 1.5 Flash API** | Extração de ~10 PDFs/dia + auditoria | **~$50** (~R$ 275) |
| **OpenCode Go** | Assinatura mensal — tokens para Hermes rodar (DeepSeek V4 Flash) | **~$10** (~R$ 55) |
| **Volume Storage (PDFs/imagens)** | 10GB a $0,15/GB (Fly.io volumes) | **~$1,50** (~R$ 8) |
| **Redis (Upstash via Fly.io)** | Filas de processamento assíncrono | **~$5** (~R$ 28) |
| **Domínio + SSL** | Let's Encrypt grátis + domínio .com.br | **~$10** (~R$ 55) |
| **Data Transfer (egress)** | ~10GB/mês a $0,04/GB (gru) | **~$0,40** (~R$ 2) |
| **Monitoramento (Sentry)** | Plano Free para começar | **$0** |
| **CDN/Storage (Cloudinary)** | Imagens das questões — opcional, pode hospedar no próprio site | **$0** (hospedado no site) |
| **Total Infraestrutura** | | **~$148/mês (~R$ 816)** |

> **Comparativo com o PIT anterior:** O PIT v1 estimava ~$630/mês (~R$ 3.465) de infraestrutura. Com dados reais do Fly.io e dimensionamento correto para a carga, o custo cai **~75%** para **~$148/mês**.

### 4.3 Por que tão mais barato?

- O PIT anterior usava **MongoDB Atlas M40** (16GB RAM, $370/mês) — superdimensionado para 100k req/mês. Um **M10** ($60/mês) aguenta tranquilamente.
- Estimava **2 instâncias de 4GB** no backend — um **shared-cpu-2x 2GB** resolve para essa carga porque:
  - 100k requests/mês = ~3.333/dia = ~2,3/minuto
  - Processamento de PDFs é **assíncrono** (Gemini API), não bloqueia o servidor
  - Hermes faz correção/reportes em **background**, não em tempo real
- O **Hermes** foi incluído na mesma máquina sem custo adicional
- **CDN** removida — imagens podem ser servidas pelo próprio servidor Fly.io

### 4.4 Se quiser escalar mais (2x de segurança)

| Item | Custo |
|------|-------|
| 2x shared-cpu-2x 2GB (backend + hermes separados) | ~$22,78 |
| MongoDB Atlas M20 (4GB RAM) | ~$120 |
| **Total com folga** | **~$208/mês (~R$ 1.145)** |

---

## 5. Custo Detalhado do Hermes Agent

### 5.1 Decomposição

| Componente | Custo/mês | Detalhe |
|------------|-----------|---------|
| **Servidor** (divide com backend) | $0 | Já incluso no Fly.io |
| **OpenCode Go** (assinatura) | $10/mês | Plano Go — DeepSeek V4 Flash incluso. Atualmente em 60% de uso mensal. |
| **Top-up de tokens** (quando exceder) | ~$5-10/mês | Reserva para escalar com mais agentes |
| **Total Hermes** | **~$10-20/mês** | |

### 5.2 Projeção de Crescimento

| Fase | Agentes rodando | Custo OpenCode Estimado |
|------|----------------|------------------------|
| **Fase 1** (1 agente: correção + relatórios) | 1 | $10/mês (60% do plano) |
| **Fase 2** (2 agentes: + relatórios alunos) | 2 | $15-20/mês |
| **Fase 3** (3 agentes: + mapas de estudo) | 3 | $25-30/mês |
| **Fase 4** (4 agentes: + tutoria) | 4 | $35-40/mês |
| **Fase 5** (multi-agente com orquestrador) | 5+ | $50-100/mês |

> O OpenCode Go tem uso "generoso" segundo eles. Com 60% de uso atual para 1 agente, cada agente adicional consome ~20-30% do plano. Quando atingir o limite, top-ups ou upgrade para plano superior resolvem.

---

## 6. Equipe e Custos Operacionais (Mínimo Viável)

### 6.1 Equipe Core (Primeiros 12 meses)

| Função | Dedicação | Custo Mensal |
|--------|-----------|-------------|
| **CTO / Desenvolvedor Full-Stack** | Tempo integral | R$ 12.000 |
| **UX/UI Designer** | Meio período (20h/sem) | R$ 4.000 |
| **Suporte / CS** | Meio período | R$ 2.500 |
| **Marketing Digital** | Tempo integral | R$ 5.000 |
| **Subtotal Equipe** | | **R$ 23.500** |

> *Nota: O Hermes Agent automatiza parte do trabalho de suporte (relatórios automáticos, correção) e reduz a necessidade de equipe de CS nos estágios iniciais.*

### 6.2 Custos Fixos Operacionais

| Item | Custo Mensal |
|------|-------------|
| Ferramentas (Notion, Slack, GitHub) | ~R$ 300 |
| Contabilidade | ~R$ 500 |
| Judicial (contratos escolares) | ~R$ 300 |
| **Subtotal Operacional** | **~R$ 1.100** |

### 6.3 Total Mensal Operacional

| Categoria | Mensal |
|-----------|--------|
| Infraestrutura (Fly.io + MongoDB + APIs) | R$ 816 |
| Hermes Agent (OpenCode Go + top-up) | R$ 55-110 |
| Equipe | R$ 23.500 |
| Operacional | R$ 1.100 |
| **Total Mensal** | **R$ 25.471-25.526** |
| **Total Anual** | **~R$ 306.000** |

---

## 7. Investimento Inicial (12 Meses)

### 7.1 CAPEX — Investimento Inicial

| Item | Valor |
|------|-------|
| **Desenvolvimento das features faltantes** (Dashboard, Gamificação, LaTeX, Filas) — 3 meses full-stack | R$ 36.000 |
| **Design System e rebranding** | R$ 8.000 |
| **Infraestrutura inicial (3 meses)** — Fly.io + MongoDB + APIs | R$ 2.700 |
| **Setup do Hermes Agent** — configuração de agentes, automação de relatórios, integração WhatsApp | R$ 6.000 |
| **Marketing de lançamento** | R$ 15.000 |
| **Registro de marca e LGPD** | R$ 5.000 |
| **Capital de giro (3 meses de operação)** | R$ 76.500 |
| **Reserva técnica (10%)** | R$ 14.920 |
| **Total CAPEX** | **R$ 164.120** |

### 7.2 Oferta de Investimento

| Valor | Participação | Valuation |
|-------|-------------|----------|
| **R$ 165.000** | **15%** | **R$ 1.100.000** |
| *Ou* | | |
| **R$ 250.000** | **20%** | **R$ 1.250.000** |

> **Redução de ~7% no CAPEX em relação ao PIT v1** devido a infraestrutura mais enxuta e inclusão inteligente do Hermes sem servidor extra.

### 7.3 Uso dos Recursos

| Destinação | % |
|------------|---|
| Desenvolvimento técnico (features + infra + Hermes) | 40% |
| Marketing e aquisição de clientes | 25% |
| Capital de giro (equipe + operação) | 25% |
| Reserva técnica | 10% |

---

## 8. Projeção Financeira (3 Anos)

| Indicador | Ano 1 | Ano 2 | Ano 3 |
|-----------|-------|-------|-------|
| **Alunos** | 10.000 | 25.000 | 50.000 |
| **Receita Bruta** | R$ 788.556 | R$ 1.971.390 | R$ 3.942.780 |
| **Custos Operacionais** | R$ 306.000 | R$ 420.000 | R$ 580.000 |
| **Custo Infraestrutura** | R$ 9.792 | R$ 24.000 | R$ 48.000 |
| **Custo Hermes/API** | R$ 3.300 | R$ 12.000 | R$ 24.000 |
| **Lucro Líquido** | **R$ 469.464** | **R$ 1.515.390** | **R$ 3.290.780** |
| **Margem Líquida** | 60% | 77% | 83% |

> *Infraestrutura escala quase linearmente com usuários. O grande custo é equipe, que é relativamente fixa.*

---

## 9. Arquitetura Técnica

```
                    ┌─────────────────────────────┐
                    │        Fly.io (gru)          │
                    │  ┌───────────────────────┐   │
                    │  │  shared-cpu-2x 2GB     │   │
                    │  │                       │   │
                    │  │  Backend (Node.js)    │   │
                    │  │  Frontend (React)     │   │
                    │  │  Hermes Agent         │   │
                    │  │  Redis (BullMQ)       │   │
                    │  └───────────────────────┘   │
                    └──────┬──────────────────────┘
                           │
         ┌─────────────────┼──────────────────────┐
         │                 │                      │
    ┌────▼────┐     ┌─────▼─────┐          ┌──────▼──────┐
    │ MongoDB │     │  Gemini   │          │  OpenCode   │
    │  Atlas  │     │  1.5 API  │          │  Go (LLM)   │
    │  M10    │     │           │          │  DeepSeek   │
    └─────────┘     └───────────┘          └─────────────┘
```

### Por que compartilhar Hermes + Backend na mesma máquina?

- **Carga leve**: 100k req/mês = ~2 req/minuto. Hermes processa em background.
- **Economia**: Uma máquina shared-cpu-2x ($11,39/mês) vs duas ($22,78/mês).
- **Simplicidade**: Único deploy, mesma rede, mesma VPC.
- **Separação futura**: Quando crescer, desacopla em 2 máquinas diferentes — o Fly.io facilita.

---

## 10. Milestones com o Investimento

| Mês | Marco |
|-----|-------|
| **Mês 0** | Setup Fly.io + MongoDB Atlas + deploy inicial |
| **Mês 1** | Features restantes (Dashboard, Gamificação, LaTeX) + Hermes configurado para correção |
| **Mês 2** | 10 escolas piloto usando — Hermes enviando relatórios para professores |
| **Mês 3** | Produto completo + Hermes Fase 2 (relatórios alunos) — 2.000 alunos pagantes |
| **Mês 6** | 5.000 alunos pagantes — ponto de equilíbrio |
| **Mês 9** | Hermes Fase 3 (mapas de estudo) + 7.500 alunos |
| **Mês 12** | **10.000 alunos pagantes — break-even operacional consolidado** |
| **Mês 18** | App Mobile + Hermes Fase 4 (tutoria) — 20.000 alunos |
| **Mês 24** | 25.000 alunos — receita > R$ 160k/mês — preparação Série A |

---

## 11. Diferenciais Competitivos

| Diferencial | gSimulados + Hermes | Concorrentes |
|-------------|-------------------|-------------|
| Extração automática de PDFs com IA | ✅ Nativo | ❌ Manual |
| Correção automática + relatórios via WhatsApp | ✅ Hermes Agent | ❌ Só dashboard web |
| Mapas de estudo personalizados | ✅ Hermes Agent (Fase 3) | ❌ Não tem |
| Banco de questões colaborativo | ✅ Sim | ❌ Fechado |
| Simulados personalizados por matéria/assunto | ✅ Sim | ⚠️ Parcial |
| Multi-tenancy (escolas + alunos) | ✅ Sim | ❌ Só aluno |
| Preço acessível (a partir de R$ 19,90) | ✅ Sim | ❌ Caro (R$ 50+) |
| Open Source (customizável) | ✅ Sim | ❌ Proprietário |
| Infraestrutura nacional (São Paulo) | ✅ Fly.io gru | ⚠️ Variado |

---

## 12. Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Concorrentes com mais capital | Média | Nicho brasileiro, preço agressivo, foco em escolas |
| Dependência de APIs de IA (Gemini) | Média | Fallback OpenAI GPT-4o mini, cache de resultados |
| OpenCode Go atingir limite de tokens | Alta | Top-up de crédito ($5-10) ou upgrade de plano |
| Baixa adesão de escolas | Média | Modelo freemium + período de teste gratuito |
| Hermes sobrecarregar o servidor compartilhado | Baixa | Separar em máquina dedicada no Fly.io (simples) |
| Custo de aquisição de cliente alto | Alta | Marketing de conteúdo + parceria com cursinhos |

---

## 13. Stack Tecnológica

| Componente | Tecnologia |
|-----------|-----------|
| **Frontend** | React 19 + Vite + Material-UI 7 |
| **Backend** | Node.js + Express 5 + TypeScript |
| **Banco de Dados** | MongoDB Atlas M10 (Mongoose 9) |
| **IA para PDFs** | Google Gemini 1.5 Flash |
| **LLM para Hermes** | OpenCode Go — DeepSeek V4 Flash |
| **Infraestrutura** | Fly.io (datacenter São Paulo — gru) |
| **Automação** | Hermes Agent (correção, relatórios, mapas de estudo) |
| **Filas** | Redis + BullMQ (via Upstash no Fly.io) |
| **Armazenamento** | Fly.io Volumes + Cloudinary (opcional) |
| **Autenticação** | JWT + Bcrypt |

---

## 14. Comparativo PIT v1 vs v2

| Item | PIT v1 (Original) | PIT v2 (Refinado) | Economia |
|------|-------------------|-------------------|----------|
| Máquinas backend | 2x 4GB RAM (~$100) | 1x 2GB RAM (~$11,39) | **~89%** |
| MongoDB | M40 16GB (~$370) | M10 2GB (~$60) | **~84%** |
| Redis | Upstash (~$30) | Upstash básico (~$5) | **~83%** |
| CDN/Storage | Cloudinary (~$50) | Hospedado no site (~$1,50) | **~97%** |
| OpenCode | Não incluso | $10/mês (Go) | **+$10** (novo) |
| Monitoramento | Sentry + Grafana (~$50) | Sentry Free ($0) | **100%** |
| **Total Infra** | **~$630/mês** | **~$148/mês** | **~77% menos** |
| **Hermes incluso?** | ❌ | ✅ | Bônus |
| **Data center BR?** | ❌ (exterior) | ✅ (São Paulo) | Bônus |

---

## 15. Contato

**Projeto:** gSimulados
**Repositório:** github.com/linikers/gSimulados
**Stack:** TypeScript Full-stack (React + Node.js + MongoDB + Hermes Agent)
**Infra:** Fly.io (gru) + MongoDB Atlas + OpenCode Go

---

*Documento gerado em junho de 2026. Valores em Real (R$) — cotação USD aproximada R$ 5,50.*
