# Get Shit Done (GSD) + Antigravity — Guia prático passo a passo

Este guia explica **como o GSD funciona de verdade**, como ele se comporta quando você usa **Antigravity / Claude Code / OpenCode**, e **o que acontece desde a instalação até a divisão automática do trabalho**.

---

## 1. Visão geral (em linguagem direta)

Sim — **o seu entendimento está correto**:

- Você instala o GSD (via `npx`, global ou local)
- Abre um projeto **já existente** (ou vazio)
- Inicia o runtime (Antigravity / Claude Code etc.)
- Executa um comando GSD
- **Ele te entrevista** sobre o projeto
- Cria documentação estruturada (`PROJECT.md`, `ROADMAP.md`, etc.)
- Divide o trabalho em fases
- Executa cada fase com sub‑agentes
- Faz commits automáticos e verificáveis

O GSD **não é um framework de código** — é um **framework de trabalho com IA**.

---

## 2. Onde o GSD funciona (ambiente)

O GSD funciona **no seu repositório Git**, rodando:

- Localmente (máquina dev)
- Em WSL
- Em VM / servidor
- Em qualquer projeto que tenha:
  - Git
  - Node.js
  - Um runtime de IA compatível

Ele **não depende da linguagem do projeto**.

---

## 3. O papel do Antigravity nesse fluxo

O **Antigravity** não é o GSD.

Ele é:

- Um _runtime / skill system_ que permite execução de agentes
- Um orquestrador de prompts + ferramentas

Quando você usa GSD com Antigravity:

- GSD fornece **estrutura, comandos e disciplina**
- Antigravity fornece **capacidade de execução inteligente**

Pense assim:

> GSD = método de trabalho
> Antigravity = cérebro operacional

---

## 4. Instalação global (recomendado para testes)

### 4.1 Pré‑requisitos

- Node.js 18+
- Git configurado
- Runtime instalado (Antigravity / Claude Code / OpenCode)

---

### 4.2 Instalar o GSD globalmente

```bash
npx get-shit-done-cc --global
```

Isso instala os comandos em:

```text
~/.claude/
```

(ou pasta equivalente do runtime)

---

### 4.3 O que é instalado

- Comandos `/gsd:*`
- Agentes auxiliares
- Templates de documentação
- Hooks opcionais de Git

Nada é instalado dentro do seu projeto ainda.

---

## 5. Abrindo um projeto existente

Entre no diretório do seu projeto:

```bash
cd meu-projeto
```

Garanta que:

```bash
git status
```

não esteja quebrado.

> ⚠️ O GSD **espera um repositório Git funcional**.

---

## 6. Iniciando o runtime (exemplo com Antigravity)

Exemplo genérico:

```bash
antigravity run
```

Ou com Claude Code:

```bash
claude --dangerously-skip-permissions
```

A partir daqui, você **não digita mais comandos normais** — você fala com o agente.

---

## 7. O comando mais importante: entrevista do projeto

```text
/gsd:new-project
```

### O que acontece internamente

1. O GSD entra em modo **Project Discovery**
2. Ele te faz perguntas como:
   - O que esse projeto faz?
   - É novo ou existente?
   - Linguagens usadas?
   - Restrições técnicas?
   - O que NÃO deve ser feito?

3. Ele consolida suas respostas

---

### Arquivos criados automaticamente

```text
PROJECT.md      → Visão geral e objetivos
CONSTRAINTS.md  → Restrições técnicas
STATE.md        → Estado atual do projeto
```

Esses arquivos **viram a fonte da verdade**.

---

## 8. Criação automática do roadmap

```text
/gsd:create-roadmap
```

### Resultado

- Fases numeradas
- Objetivos claros
- Ordem lógica

Arquivo gerado:

```text
ROADMAP.md
```

Exemplo:

```md
Phase 1: Setup & Base Architecture
Phase 2: Core Features
Phase 3: Integrations
Phase 4: Tests & Hardening
```

---

## 9. Discussão humana (parte crítica)

```text
/gsd:discuss-phase 1
```

Aqui você:

- Corrige decisões erradas
- Impõe padrões
- Diz "não faça isso"

Isso evita código ruim.

---

## 10. Planejamento automático da fase

```text
/gsd:plan-phase 1
```

O GSD:

- Divide a fase em tarefas pequenas
- Define critérios de aceite
- Define arquivos afetados

Arquivo:

```text
PHASE_1_PLAN.md
```

---

## 11. Execução real (onde a mágica acontece)

```text
/gsd:execute-phase 1
```

Internamente:

- Cada tarefa roda em **sub‑agente isolado**
- Contexto limpo
- Commits automáticos

Você verá commits como:

```text
feat: add base API structure
fix: correct config loading
```

---

## 12. Verificação

```text
/gsd:verify-work 1
```

O agente:

- Lê critérios
- Confere código
- Aponta falhas

Nada passa sem validação.

---

## 13. Tipos de projeto ideais

✔ APIs REST / GraphQL
✔ Backends Node, Python, Go
✔ Frontend React / Vite
✔ CLIs
✔ MVPs
✔ Refactors grandes

🚫 Não indicado para:

- Código experimental caótico
- Projetos sem Git
- Scripts descartáveis

---

## 14. Integrações: como aplicar corretamente

### Regra de ouro

> Integrações **só entram depois da base pronta**

Fluxo correto:

1. Core funcional
2. Testes
3. Integrações externas

Exemplo:

```text
Phase 3: Integrate Stripe + Webhooks
```

Nunca misture integração com setup inicial.

---

## 15. Resumo final

- ✅ Sim, ele te entrevista
- ✅ Sim, cria documentação
- ✅ Sim, divide o trabalho
- ✅ Sim, executa com commits
- ⚠️ Exige disciplina

https://github.com/glittercowboy/get-shit-done

---

skill google para testes futuros
https://github.com/sickn33/antigravity-awesome-skills
