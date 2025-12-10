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
# cd c:\repositorios\gSimulados
```
