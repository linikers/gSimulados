# 🤖 AGENTS.md - Guia de Implementação para gSimulados

## O que é AGENTS.md?

**AGENTS.md** é um arquivo Markdown padronizado que funciona como um "README para IAs". Ele fornece instruções claras e contexto para ferramentas de IA (GitHub Copilot, Cursor, Claude, etc.) trabalharem no seu projeto.

**Diferença do README.md:**

- `README.md` → Para humanos (overview, instalação)
- `AGENTS.md` → Para IAs (convenções, comandos, estrutura)

---

## Benefícios para o gSimulados

### 1. **Qualidade de Código**

✅ IA gera código seguindo suas convenções  
✅ Menos revisões manuais  
✅ Consistência automática

### 2. **Onboarding Rápido**

✅ Nova IA entende o projeto instantaneamente  
✅ Não precisa explicar estrutura toda vez  
✅ Funciona com Cursor, Copilot, Claude, etc

### 3. **Eficiência**

✅ IA sabe onde criar arquivos  
✅ Segue padrões de nomenclatura  
✅ Usa bibliotecas corretas

---

## Estrutura Recomendada para gSimulados

````markdown
# AGENTS.md - gSimulados

## Visão Geral

Plataforma de simulados para vestibulares com banco de questões e IA.

**Stack:**

- Monorepo (Yarn Workspaces)
- Backend: Node.js + Express + MongoDB
- Frontend: React + TypeScript + Material-UI
- IA: OpenAI GPT-4 Vision, Google Gemini

---

## Estrutura do Projeto

\`\`\`
gSimulados/
├── apps/
│ ├── api/ # Backend (Express + MongoDB)
│ └── web/ # Frontend (React + Vite)
├── packages/
│ └── shared/ # Tipos compartilhados
└── docs/ # Documentação
\`\`\`

---

## Convenções de Código

### Backend (apps/api)

**Models:**

- Localização: \`apps/api/src/models/\`
- Nomenclatura: PascalCase (ex: \`Question.ts\`, \`Vestibular.ts\`)
- Padrão: Mongoose Schema + Interface TypeScript
- Exemplo:
  \`\`\`typescript
  export interface IQuestion extends Document {
  enunciado: string;
  alternativas: string[];
  respostaCorreta: string;
  }
  const QuestionSchema: Schema = new Schema({ ... });
  export const Question = mongoose.model<IQuestion>("Question", QuestionSchema);
  \`\`\`

**Controllers:**

- Localização: \`apps/api/src/controllers/\`
- Nomenclatura: \`nome.controller.ts\` (ex: \`questions.controller.ts\`)
- Padrão: Classe com métodos estáticos
- Exemplo:
  \`\`\`typescript
  export class QuestionsController {
  static async list(req: Request, res: Response) { ... }
  static async create(req: Request, res: Response) { ... }
  }
  \`\`\`

**Routes:**

- Localização: \`apps/api/src/routes/\`
- Nomenclatura: \`nome.routes.ts\` (ex: \`questions.routes.ts\`)
- Padrão: Express Router
- Proteção: Usar \`authMiddleware\` para rotas protegidas

**Services:**

- Localização: \`apps/api/src/services/\`
- Nomenclatura: \`nome.service.ts\` (ex: \`gpt-vision.service.ts\`)
- Padrão: Funções exportadas ou classe

### Frontend (apps/web)

**Pages:**

- Localização: \`apps/web/src/pages/\`
- Estrutura: \`pages/[role]/[Module]/ComponentName.tsx\`
- Exemplo: \`pages/admin/Vestibulares/GerenciarVestibulares.tsx\`
- Padrão: Function component com hooks

**Services:**

- Localização: \`apps/web/src/services/\`
- Nomenclatura: \`nome.service.ts\` (ex: \`vestibulares.service.ts\`)
- Padrão: Objeto com métodos async
- Exemplo:
  \`\`\`typescript
  export const VestibularesService = {
  list: async () => { ... },
  create: async (data) => { ... },
  };
  \`\`\`

**Components:**

- Localização: \`apps/web/src/components/\`
- Nomenclatura: PascalCase
- Padrão: Material-UI v5

---

## Comandos

### Desenvolvimento

\`\`\`bash
yarn dev # Inicia backend + frontend
yarn workspace @gsimulados/api dev # Apenas backend
yarn workspace @gsimulados/web dev # Apenas frontend
\`\`\`

### Build

\`\`\`bash
yarn build # Build completo
\`\`\`

### Testes

\`\`\`bash
yarn test # Rodar testes (quando implementado)
\`\`\`

---

## Regras Importantes

### ❌ NÃO FAÇA:

- Usar \`any\` type (sempre tipar corretamente)
- Criar arquivos fora de \`apps/\` ou \`packages/\`
- Misturar lógica de negócio em componentes React
- Usar \`var\` (sempre \`const\` ou \`let\`)
- Importar de \`@mui/material\` sem destructuring

### ✅ SEMPRE FAÇA:

- Usar TypeScript estrito
- Seguir estrutura de pastas existente
- Adicionar tipos para props e state
- Usar \`useCallback\` para funções em \`useEffect\`
- Tratar erros com try/catch
- Atualizar documentação em \`docs/\`

---

## Fluxo de Trabalho

### Adicionar Nova Feature

1. **Backend:**

   - Criar model em \`apps/api/src/models/\`
   - Criar controller em \`apps/api/src/controllers/\`
   - Criar routes em \`apps/api/src/routes/\`
   - Registrar routes em \`apps/api/src/app.ts\`

2. **Frontend:**

   - Criar service em \`apps/web/src/services/\`
   - Criar page em \`apps/web/src/pages/\`
   - Adicionar route em \`apps/web/src/App.tsx\`
   - Adicionar menu em \`apps/web/src/config/navigation.ts\`

3. **Documentação:**
   - Atualizar \`docs/ROUTES.md\`
   - Criar doc específica em \`docs/\` se necessário

---

## Variáveis de Ambiente

### Backend (\`apps/api/.env\`)

\`\`\`env
MONGO_URI=mongodb://localhost:27017/gsimulados
JWT_SECRET=your_secret_key
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
\`\`\`

### Frontend (\`apps/web/.env\`)

\`\`\`env
VITE_API_URL=http://localhost:3001
\`\`\`

---

## Módulos Principais

### 1. Autenticação

- Models: \`User.ts\`
- Controllers: \`auth.controller.ts\`
- Middleware: \`auth.middleware.ts\`

### 2. Banco de Questões

- Models: \`Question.ts\`, \`DriveConfig.ts\`, \`PdfSource.ts\`, \`ExtractedQuestion.ts\`
- Services: \`gpt-vision.service.ts\`, \`google-drive.service.ts\`
- Docs: \`docs/BANCO_QUESTOES.md\`, \`docs/GPT4_VISION_INTEGRATION.md\`

### 3. Vestibulares

- Models: \`Vestibular.ts\`
- Controllers: \`vestibulares.controller.ts\`
- Services: \`scraping.service.ts\`
- Docs: \`docs/VESTIBULARES_MODULE.md\`

### 4. Simulados (Futuro)

- Models: \`Simulado.ts\`
- Services: \`simulado-generator.service.ts\`
- Docs: \`docs/IA_GERACAO_SIMULADOS.md\`

---

## Referências

- Arquitetura: \`docs/MAINTENANCE.md\`
- Rotas: \`docs/ROUTES.md\`
- Scraping: \`docs/SCRAPING_GUIDE.md\`
  \`\`\`

---

## Como Implementar no Projeto

### 1. Criar Arquivo

```bash
cd c:\repositorios\gSimulados
# Criar AGENTS.md na raiz
```
````

### 2. Copiar Template Acima

Use o template acima como base.

### 3. Testar com IA

Abra o projeto no Cursor/Copilot e peça:

> "Crie um novo controller para Simulados seguindo as convenções do projeto"

A IA vai ler o `AGENTS.md` e gerar código correto automaticamente!

---

## Impacto no Projeto gSimulados

### ⚡ Impacto Imediato

| Aspecto                    | Antes     | Depois      |
| -------------------------- | --------- | ----------- |
| Tempo de explicação        | 10-15 min | 0 min       |
| Qualidade do código gerado | 60%       | 90%         |
| Consistência               | Manual    | Automática  |
| Onboarding de nova IA      | Difícil   | Instantâneo |

### 📈 Benefícios de Longo Prazo

1. **Escalabilidade:** Fácil adicionar novos devs/IAs
2. **Manutenibilidade:** Código sempre consistente
3. **Documentação Viva:** AGENTS.md evolui com o projeto
4. **Produtividade:** IA gera código pronto para produção

### 💰 Custo

**Zero!** É apenas um arquivo Markdown.

---

## Compatibilidade

✅ **Funciona com:**

- GitHub Copilot
- Cursor
- Claude (Anthropic)
- OpenAI Codex
- Google Jules
- Aider
- Qualquer ferramenta que leia Markdown

---

## Próximos Passos

1. ✅ Criar `AGENTS.md` na raiz do projeto
2. ✅ Adicionar convenções específicas
3. ✅ Testar com Cursor/Copilot
4. ⏳ Criar `AGENTS.md` aninhados (ex: `apps/api/AGENTS.md`)
5. ⏳ Atualizar conforme projeto evolui

---

## Exemplo Prático

**Sem AGENTS.md:**

```
Você: "Crie um controller para Simulados"
IA: *Cria arquivo em lugar errado, usa padrões diferentes*
Você: "Não, siga o padrão do projeto..."
IA: *Tenta novamente, ainda inconsistente*
```

**Com AGENTS.md:**

```
Você: "Crie um controller para Simulados"
IA: *Lê AGENTS.md*
IA: *Cria apps/api/src/controllers/simulados.controller.ts*
IA: *Usa classe com métodos estáticos*
IA: *Segue todas as convenções*
Você: ✅ Perfeito!
```

---

## Conclusão

**AGENTS.md é essencial para projetos que usam IA!**

- ✅ Fácil de implementar (1 arquivo)
- ✅ Zero custo
- ✅ Impacto massivo na produtividade
- ✅ Funciona com todas as ferramentas

**Recomendação:** Implemente AGORA! 🚀
