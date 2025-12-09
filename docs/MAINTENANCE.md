# 🛠️ Guia de Manutenção e Arquitetura

Este documento serve como guia para entender a estrutura do projeto `Plataforma Simulados` e facilitar a manutenção e expansão do código.

## 🏗️ Estrutura do Monorepo

O projeto utiliza **Yarn Workspaces** para gerenciar múltiplos pacotes no mesmo repositório:

- `apps/web`: Frontend (React + Vite + Material UI).
- `apps/api`: Backend (Node.js + Express + MongoDB + Mongoose).
- `packages/shared`: Tipos e interfaces compartilhados (TypeScript).

## 🖥️ Backend (`apps/api`)

### Padrão de Arquitetura

Utilizamos o padrão **MVC (Model-View-Controller)** simplificado para API Rest:

1.  **Models** (`src/models`): Definem o Schema do banco de dados (Mongoose).
    - _Regra_: Todo modelo deve ter uma Interface correspondente em `@gsimulados/shared`.
2.  **Controllers** (`src/controllers`): Contêm a regra de negócios e lógica de resposta.
    - _Regra_: Métodos estáticos (`static async method`) para agrupar funcionalidades. Tratamento de erro (`try/catch`) deve ser feito aqui.
3.  **Routes** (`src/routes`): Definem os endpoints e aplicam middlewares.
    - _Regra_: Rotas não devem ter lógica, apenas apontar para Controllers e Middlewares.
4.  **Middlewares** (`src/middlewares`): Interceptadores para validação (ex: `authMiddleware`).

### Fluxo de Criação de Nova Feature (Backend)

1.  Criar/Atualizar **Interface** em `packages/shared`.
2.  Criar **Model** em `src/models`.
3.  Criar **Controller** em `src/controllers`.
4.  Criar **Rota** em `src/routes`.
5.  Registrar rota em `src/app.ts`.

---

## 🎨 Frontend (`apps/web`)

### Estrutura de Pastas

- `src/pages`: Telas da aplicação, organizadas por módulo (`admin`, `aluno`, `auth`).
- `src/components`:
  - `ui`: Componentes genéricos e reutilizáveis (Botões, Inputs, Cards). _Evite hardcode de estilos nas páginas._
  - `features`: Componentes específicos de negócio (ex: `QuestionCard`).
- `src/services`: Camada de comunicação com a API (Axios).
  - _Regra_: Toda chamada API deve estar isolada aqui, nunca direto no componente.
- `src/layouts`: Estruturas de página (Sidebar, Header).
- `src/hooks`: Custom hooks (ex: `useAuth`, `useToast`).

### Fluxo de Criação de Nova Feature (Frontend)

1.  Criar **Service** em `src/services` para consumir a nova API.
2.  Criar **Componentes UI** necessários em `src/components/ui`.
3.  Criar **Página** em `src/pages`.
4.  Adicionar **Rota** em `src/App.tsx`.
5.  Adicionar item no **Menu** em `src/config/navigation.ts` (se necessário).

## 🔄 Fluxo de Trabalho Recomendado

1.  **Definir Tipos**: Comece sempre definindo as interfaces em `packages/shared`. Isso garante que Frontend e Backend falem a mesma língua.
2.  **Backend First**: Implemente a API e teste (via Postman ou Curl).
3.  **Frontend Integration**: Crie o Service e depois a Interface Visual.

## 📝 Padrões de Código

- **Nomenclatura**:
  - Arquivos: `nomeArquivo.ts` ou `NomeComponente.tsx` (PascalCase para componentes).
  - Variáveis/Funções: `camelCase`.
  - Pastas: `kebab-case` ou `camelCase` (mantenha consistência).
- **Commits**:
  - Use verbos no imperativo (ex: "Add Question model", "Fix login bug").

## 🚀 Comandos Úteis

- `yarn dev`: Roda tudo (Web + API).
- `yarn workspace @gsimulados/api add <lib>`: Instala lib apenas no backend.
- `yarn workspace @gsimulados/web add <lib>`: Instala lib apenas no frontend.
