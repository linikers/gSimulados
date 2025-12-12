# 🎓 Plataforma de Simulados Gerados por IA

## 📋 Sumário Executivo

### Visão Geral

Sistema SaaS B2B2C para criação automatizada e inteligente de simulados baseados em provas reais de vestibulares. A plataforma utiliza IA generativa para criar questões personalizadas, adaptando-se ao nível de conhecimento de cada aluno.

### Proposta de Valor

- **Para Escolas**: Ferramenta completa de avaliação com analytics avançados
- **Para Alunos**: Simulados personalizados que se adaptam ao seu nível
- **Para Administradores**: Plataforma escalável e gerenciável

---

## 🎯 Objetivos e Metas

### Objetivo Principal

Democratizar o acesso a simulados de qualidade através de tecnologia de IA, permitindo que escolas ofereçam avaliações personalizadas sem necessidade de equipe especializada.

### Metas SMART

#### Curto Prazo (3 meses)

- ✅ Desenvolver MVP com sistema completo de autenticação
- ✅ Implementar gestão de usuários (3 níveis)
- ✅ Criar interface administrativa funcional
- ✅ Estabelecer conexão com MongoDB
- [ ] Deploy inicial na Vercel

#### Médio Prazo (6 meses)

- 📊 Integrar primeira IA para geração de questões
- 📚 Construir biblioteca com 1000+ questões
- 🏫 Onboarding de 10 escolas beta
- 👥 Base de 500+ alunos ativos
- 📈 Sistema de analytics operacional

#### Longo Prazo (12 meses)

- 🤖 Integração com 5+ APIs de universidades
- 🌐 Migração completa para AWS
- 💰 Modelo de negócio validado
- 📊 50+ escolas ativas
- 🎓 10.000+ alunos na plataforma

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico Completo

#### Frontend

| Tecnologia            | Versão | Propósito                   |
| --------------------- | ------ | --------------------------- |
| **React**             | 18.x   | Framework UI principal      |
| **TypeScript**        | 5.x    | Type safety e DX            |
| **Vite**              | 5.x    | Build tool e dev server     |
| **Material-UI (MUI)** | 5.x    | Sistema de design           |
| **React Router**      | 6.x    | Roteamento SPA              |
| **React Query**       | 5.x    | State management assíncrono |
| **Zustand**           | 4.x    | State management global     |
| **Axios**             | 1.x    | HTTP client                 |

**Justificativa MUI**:

- Componentes prontos e acessíveis (WCAG 2.1)
- Sistema de theming robusto para white-label
- Documentação extensa
- Suporte a customização profunda
- Componentes de formulário avançados
- Grid system responsivo
- Integração nativa com TypeScript

#### Backend

| Tecnologia     | Versão   | Propósito              |
| -------------- | -------- | ---------------------- |
| **Node.js**    | 20.x LTS | Runtime JavaScript     |
| **Express**    | 4.x      | Framework HTTP         |
| **TypeScript** | 5.x      | Type safety            |
| **MongoDB**    | 7.x      | Banco de dados NoSQL   |
| **Mongoose**   | 8.x      | ODM MongoDB            |
| **JWT**        | 9.x      | Autenticação stateless |
| **Bcrypt**     | 5.x      | Hash de senhas         |

#### IA e Processamento

| Tecnologia     | Propósito              |
| -------------- | ---------------------- |
| **OpenAI API** | Geração de questões    |
| **LangChain**  | Orquestração de LLMs   |
| **pdf-parse**  | Extração de texto PDFs |
| **cheerio**    | Web scraping           |

#### Infraestrutura

| Ambiente              | Plataforma | Propósito                 |
| --------------------- | ---------- | ------------------------- |
| **Desenvolvimento**   | Local      | Desenvolvimento ágil      |
| **Staging**           | Vercel     | Testes e validação        |
| **Produção (Futuro)** | AWS        | Escalabilidade enterprise |

---

## 📂 Estrutura de Pastas Detalhada

### Visão Completa do Monorepo

```
plataforma-simulados/
│
├── apps/
│   ├── web/                           # Frontend React
│   │   ├── public/
│   │   │   ├── favicon.ico
│   │   │   └── assets/
│   │   ├── src/
│   │   │   ├── main.tsx              # Entry point
│   │   │   ├── App.tsx               # Root component
│   │   │   ├── vite-env.d.ts
│   │   │   │
│   │   │   ├── pages/                # Páginas da aplicação
│   │   │   │   ├── auth/
│   │   │   │   │   ├── Login.tsx
│   │   │   │   │   ├── Register.tsx
│   │   │   │   │   └── ForgotPassword.tsx
│   │   │   │   │
│   │   │   │   ├── admin/            # Área administrativa
│   │   │   │   │   ├── Dashboard.tsx
│   │   │   │   │   ├── Escolas/
│   │   │   │   │   │   ├── ListaEscolas.tsx
│   │   │   │   │   │   ├── CadastroEscola.tsx
│   │   │   │   │   │   └── DetalhesEscola.tsx
│   │   │   │   │   ├── Configuracoes/
│   │   │   │   │   │   ├── SistemaConfig.tsx
│   │   │   │   │   │   └── IntegracaoIA.tsx
│   │   │   │   │   └── Analytics/
│   │   │   │   │       └── DashboardGeral.tsx
│   │   │   │   │
│   │   │   │   ├── escola/           # Área das escolas
│   │   │   │   │   ├── Dashboard.tsx
│   │   │   │   │   ├── Alunos/
│   │   │   │   │   │   ├── ListaAlunos.tsx
│   │   │   │   │   │   ├── CadastroAluno.tsx
│   │   │   │   │   │   └── DetalhesAluno.tsx
│   │   │   │   │   ├── Turmas/
│   │   │   │   │   │   ├── ListaTurmas.tsx
│   │   │   │   │   │   └── GestaoTurma.tsx
│   │   │   │   │   ├── Simulados/
│   │   │   │   │   │   ├── ListaSimulados.tsx
│   │   │   │   │   │   ├── CriarSimulado.tsx
│   │   │   │   │   │   └── ConfigurarSimulado.tsx
│   │   │   │   │   └── Relatorios/
│   │   │   │   │       ├── DesempenhoGeral.tsx
│   │   │   │   │       └── RelatorioIndividual.tsx
│   │   │   │   │
│   │   │   │   └── aluno/            # Área dos alunos
│   │   │   │       ├── Dashboard.tsx
│   │   │   │       ├── MeusSimulados.tsx
│   │   │   │       ├── RealizarSimulado.tsx
│   │   │   │       ├── Resultados.tsx
│   │   │   │       └── MeuDesempenho.tsx
│   │   │   │
│   │   │   ├── components/           # Componentes reutilizáveis
│   │   │   │   ├── layout/
│   │   │   │   │   ├── AppLayout.tsx
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   ├── Navbar.tsx
│   │   │   │   │   └── Footer.tsx
│   │   │   │   ├── ui/              # Componentes base
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   ├── Table.tsx
│   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   └── LoadingSpinner.tsx
│   │   │   │   ├── forms/           # Componentes de formulário
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   ├── Select.tsx
│   │   │   │   │   └── DatePicker.tsx
│   │   │   │   └── features/        # Componentes específicos
│   │   │   │       ├── QuestaoCard.tsx
│   │   │   │       ├── SimuladoCard.tsx
│   │   │   │       └── GraficoDesempenho.tsx
│   │   │   │
│   │   │   ├── contexts/            # React Context
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   ├── ThemeContext.tsx
│   │   │   │   └── NotificationContext.tsx
│   │   │   │
│   │   │   ├── hooks/               # Custom hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── usePermissions.ts
│   │   │   │   ├── useSimulados.ts
│   │   │   │   └── useNotification.ts
│   │   │   │
│   │   │   ├── services/            # API clients
│   │   │   │   ├── api.ts           # Axios instance
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── escolas.service.ts
│   │   │   │   ├── alunos.service.ts
│   │   │   │   └── simulados.service.ts
│   │   │   │
│   │   │   ├── store/               # Zustand stores
│   │   │   │   ├── authStore.ts
│   │   │   │   └── appStore.ts
│   │   │   │
│   │   │   ├── types/               # TypeScript types
│   │   │   │   ├── user.types.ts
│   │   │   │   ├── escola.types.ts
│   │   │   │   ├── aluno.types.ts
│   │   │   │   └── simulado.types.ts
│   │   │   │
│   │   │   ├── utils/               # Funções utilitárias
│   │   │   │   ├── formatters.ts
│   │   │   │   ├── validators.ts
│   │   │   │   └── constants.ts
│   │   │   │
│   │   │   ├── styles/              # Estilos globais
│   │   │   │   ├── theme.ts         # MUI theme
│   │   │   │   └── global.css
│   │   │   │
│   │   │   └── routes/              # Configuração de rotas
│   │   │       ├── index.tsx
│   │   │       ├── PrivateRoute.tsx
│   │   │       └── RoleRoute.tsx
│   │   │
│   │   ├── .env.development
│   │   ├── .env.production
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.node.json
│   │   └── vite.config.ts
│   │
│   └── api/                          # Backend Node.js
│       ├── src/
│       │   ├── server.ts            # Entry point
│       │   │
│       │   ├── config/              # Configurações
│       │   │   ├── database.ts      # MongoDB connection
│       │   │   ├── jwt.ts           # JWT config
│       │   │   └── environment.ts   # Env variables
│       │   │
│       │   ├── models/              # Mongoose models
│       │   │   ├── User.ts
│       │   │   ├── Escola.ts
│       │   │   ├── Aluno.ts
│       │   │   ├── Turma.ts
│       │   │   ├── Simulado.ts
│       │   │   ├── Questao.ts
│       │   │   └── Resultado.ts
│       │   │
│       │   ├── controllers/         # Controladores
│       │   │   ├── auth.controller.ts
│       │   │   ├── users.controller.ts
│       │   │   ├── escolas.controller.ts
│       │   │   ├── alunos.controller.ts
│       │   │   ├── turmas.controller.ts
│       │   │   ├── simulados.controller.ts
│       │   │   └── questoes.controller.ts
│       │   │
│       │   ├── routes/              # Rotas Express
│       │   │   ├── index.ts
│       │   │   ├── auth.routes.ts
│       │   │   ├── users.routes.ts
│       │   │   ├── escolas.routes.ts
│       │   │   ├── alunos.routes.ts
│       │   │   └── simulados.routes.ts
│       │   │
│       │   ├── middlewares/         # Middlewares
│       │   │   ├── auth.middleware.ts
│       │   │   ├── role.middleware.ts
│       │   │   ├── validation.middleware.ts
│       │   │   ├── error.middleware.ts
│       │   │   └── logger.middleware.ts
│       │   │
│       │   ├── services/            # Lógica de negócio
│       │   │   ├── auth/
│       │   │   │   ├── jwt.service.ts
│       │   │   │   └── password.service.ts
│       │   │   ├── ia/
│       │   │   │   ├── openai.service.ts
│       │   │   │   ├── questao-generator.service.ts
│       │   │   │   └── simulado-generator.service.ts
│       │   │   ├── universidades/
│       │   │   │   ├── fuvest.service.ts
│       │   │   │   ├── enem.service.ts
│       │   │   │   └── scraper.service.ts
│       │   │   ├── email/
│       │   │   │   └── email.service.ts
│       │   │   └── analytics/
│       │   │       └── metrics.service.ts
│       │   │
│       │   ├── utils/               # Utilitários
│       │   │   ├── validators.ts
│       │   │   ├── logger.ts
│       │   │   ├── errors.ts
│       │   │   └── helpers.ts
│       │   │
│       │   └── types/               # TypeScript types
│       │       ├── express.d.ts
│       │       └── models.types.ts
│       │
│       ├── tests/                   # Testes
│       │   ├── unit/
│       │   ├── integration/
│       │   └── e2e/
│       │
│       ├── .env.development
│       ├── .env.production
│       ├── package.json
│       ├── tsconfig.json
│       └── nodemon.json
│
├── packages/
│   └── shared/                      # Código compartilhado
│       ├── src/
│       │   ├── types/
│       │   │   ├── user.ts
│       │   │   ├── escola.ts
│       │   │   ├── aluno.ts
│       │   │   └── simulado.ts
│       │   ├── constants/
│       │   │   ├── roles.ts
│       │   │   └── permissions.ts
│       │   └── utils/
│       │       └── validators.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docs/                            # Documentação
│   ├── api/                         # Docs da API
│   │   ├── authentication.md
│   │   └── endpoints.md
│   ├── architecture/                # Diagramas
│   │   ├── system-design.md
│   │   └── database-schema.md
│   └── guides/                      # Guias
│       ├── setup.md
│       └── deployment.md
│
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── package.json                     # Root package.json
├── tsconfig.json                    # Root TS config
├── yarn.lock
└── README.md
```

---

## 👥 Hierarquia e Permissões de Usuários

### 1. 👨‍💼 ADMINISTRADOR (Admin)

#### Descrição

Gestores da plataforma com controle total do sistema. Responsáveis pela operação, manutenção e crescimento da plataforma.

#### Responsabilidades

- Onboarding e gestão de escolas clientes
- Configuração de integrações externas
- Monitoramento de performance do sistema
- Suporte técnico de segundo nível
- Análise de métricas de negócio
- Gestão de faturamento e planos

#### Funcionalidades Disponíveis

**Dashboard Administrativo**

- KPIs principais (MAU, receita, churn)
- Gráficos de crescimento
- Status de sistemas integrados
- Alertas e notificações críticas

**Gestão de Escolas**

- CRUD completo de escolas
- Ativação/desativação de contas
- Alteração de planos (upgrade/downgrade)
- Configuração de limites por plano
- Histórico de faturamento
- Suporte e tickets

**Configurações do Sistema**

- Parâmetros globais
- Integração com APIs externas
- Configuração de IA (modelos, prompts)
- Gestão de e-mails transacionais
- Backup e restore

**Analytics e Relatórios**

- Relatórios de uso por escola
- Performance de IA
- Logs de sistema
- Auditoria de ações

#### Permissões (RBAC)

```typescript
ADMIN: {
  escolas: ['create', 'read', 'update', 'delete'],
  usuarios: ['read', 'update', 'delete'],
  sistema: ['config', 'logs', 'backup'],
  financeiro: ['read', 'update'],
  analytics: ['read']
}
```

---

### 2. 🏫 ESCOLA (Cliente)

#### Descrição

Instituições de ensino que contratam a plataforma. São o cliente direto e gerenciam seus alunos e conteúdo educacional.

#### Responsabilidades

- Cadastro e gestão de alunos
- Criação e distribuição de simulados
- Acompanhamento pedagógico
- Análise de desempenho dos alunos
- Comunicação com alunos e responsáveis

#### Funcionalidades Disponíveis

**Dashboard da Escola**

- Resumo de alunos ativos
- Simulados em andamento
- Métricas de desempenho geral
- Últimas atividades
- Alertas pedagógicos

**Gestão de Alunos**

- Cadastro individual ou em lote (CSV)
- Edição de dados dos alunos
- Ativação/inativação de contas
- Organização em turmas
- Atribuição de professores responsáveis
- Visualização de histórico completo

**Gestão de Turmas**

- Criação de turmas
- Associação de alunos
- Definição de período letivo
- Atribuição de simulados por turma

**Criação de Simulados**

- Criação manual (seleção de questões)
- Criação automática via IA
- Configuração de parâmetros:
  - Duração
  - Quantidade de questões
  - Nível de dificuldade
  - Matérias/assuntos
  - Período de disponibilidade
- Agendamento de provas
- Turmas participantes

**Biblioteca de Questões**

- Busca e filtro de questões
- Preview de questões
- Marcação de favoritos
- Importação de questões

**Relatórios e Analytics**

- Desempenho por aluno
- Desempenho por turma
- Comparativos temporais
- Identificação de dificuldades
- Ranking de desempenho
- Exportação de relatórios (PDF/Excel)
- Gráficos interativos

**Configurações da Escola**

- Dados cadastrais
- Logo e identidade visual
- Preferências de notificação
- Gestão de usuários da escola (professores)

#### Permissões (RBAC)

```typescript
ESCOLA: {
  alunos: ['create', 'read', 'update', 'delete'], // Apenas seus alunos
  turmas: ['create', 'read', 'update', 'delete'],
  simulados: ['create', 'read', 'update', 'delete'],
  questoes: ['read'], // Biblioteca completa
  relatorios: ['read'], // Apenas de seus alunos
  escola: ['read', 'update'] // Seus próprios dados
}
```

#### Limites por Plano

**Plano Básico** (R$ 299/mês)

- Até 50 alunos
- 20 simulados/mês
- Relatórios básicos
- Suporte por e-mail

**Plano Premium** (R$ 599/mês)

- Até 200 alunos
- Simulados ilimitados
- Relatórios avançados
- Criação automática via IA
- Suporte prioritário

**Plano Enterprise** (Customizado)

- Alunos ilimitados
- White-label
- API própria
- Gerente de conta dedicado
- SLA garantido

---

### 3. 🎓 ALUNO

#### Descrição

Usuário final que realiza os simulados. Acesso limitado focado na experiência de aprendizado.

#### Responsabilidades

- Realizar simulados disponibilizados
- Acompanhar próprio desempenho
- Estudar com base nos resultados
- Manter perfil atualizado

#### Funcionalidades Disponíveis

**Dashboard do Aluno**

- Próximos simulados
- Últimos resultados
- Progresso geral
- Metas pessoais
- Ranking na turma (se habilitado)

**Meus Simulados**

- Lista de simulados disponíveis
- Filtros (status, data, matéria)
- Informações do simulado:
  - Data de liberação
  - Prazo final
  - Duração
  - Quantidade de questões
  - Matérias abordadas

**Realizar Simulado**

- Interface limpa de prova
- Timer visual
- Navegação entre questões
- Marcação para revisão
- Rascunho automático (salva progresso)
- Confirmação antes de finalizar

**Meus Resultados**

- Lista de simulados realizados
- Nota e percentual de acertos
- Tempo gasto
- Comparação com média da turma
- Gabarito detalhado
- Revisão de respostas
- Comentários das questões

**Meu Desempenho**

- Gráfico de evolução temporal
- Desempenho por matéria
- Identificação de pontos fracos
- Histórico completo
- Metas e objetivos
- Conquistas (gamificação)

**Perfil**

- Dados pessoais básicos
- Foto de perfil
- Curso pretendido
- Preferências de notificação

#### Permissões (RBAC)

```typescript
ALUNO: {
  simulados: ['read'], // Apenas simulados atribuídos
  resultados: ['read'], // Apenas próprios resultados
  perfil: ['read', 'update'], // Apenas próprio perfil
  ranking: ['read'] // Se habilitado pela escola
}
```

#### Restrições

- Não pode ver dados de outros alunos
- Não pode editar simulados
- Não pode acessar área administrativa
- Não pode exportar dados em massa

---

## 🔐 Sistema de Autenticação e Autorização

### Arquitetura de Segurança

#### Estratégia: JWT (JSON Web Tokens)

**Vantagens:**

- Stateless (não requer sessão no servidor)
- Escalável horizontalmente
- Compatível com microserviços
- Suporte nativo em várias linguagens

**Estrutura do Token:**

```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: "admin" | "escola" | "aluno";
  escolaId?: string; // Para escolas e alunos
  permissions: string[];
  iat: number; // Issued at
  exp: number; // Expiration
}
```

### Fluxo de Autenticação Completo

#### 1. Login

```
┌─────────┐         ┌─────────┐         ┌──────────┐
│ Cliente │         │   API   │         │ Database │
└────┬────┘         └────┬────┘         └────┬─────┘
     │                   │                   │
     │  POST /auth/login │                   │
     │─────────────────>│                   │
     │  {email, senha}   │                   │
     │                   │                   │
     │                   │ Busca user        │
     │                   │──────────────────>│
     │                   │                   │
     │                   │ User data         │
     │                   │<──────────────────│
     │                   │                   │
     │                   │ Valida senha      │
     │                   │ (bcrypt.compare)  │
     │                   │                   │
     │                   │ Gera JWT          │
     │                   │ Gera Refresh Token│
     │                   │                   │
     │ {                 │                   │
     │   accessToken,    │                   │
     │   refreshToken,   │                   │
     │   user            │                   │
     │ }                 │                   │
     │<─────────────────│                   │
     │                   │                   │
```

#### 2. Requisições Autenticadas

```
┌─────────┐         ┌─────────┐
│ Cliente │         │   API   │
└────┬────┘         └────┬────┘
     │                   │
     │ GET /api/alunos   │
     │ Authorization:    │
     │ Bearer <token>    │
     │─────────────────>│
     │                   │
     │                   │ Valida JWT
     │                   │ Verifica permissões
     │                   │
     │                   │ ✓ Autorizado
     │                   │
     │ Response          │
     │<─────────────────│
     │                   │
```

#### 3. Refresh Token

```
┌─────────┐         ┌─────────┐
│ Cliente │         │   API   │
└────┬────┘         └────┬────┘
     │                   │
     │ Token expirado    │
     │ (401)             │
     │<─────────────────│
     │                   │
     │ POST /auth/refresh│
     │ {refreshToken}    │
     │─────────────────>│
     │                   │
     │                   │ Valida refresh token
     │                   │ Gera novo access token
     │                   │
     │ {accessToken}     │
     │<─────────────────│
     │                   │
     │ Retry request     │
     │─────────────────>│
     │                   │
```

### RBAC (Role-Based Access Control)

#### Matriz de Permissões

| Recurso                      | Admin | Escola           | Aluno           |
| ---------------------------- | ----- | ---------------- | --------------- |
| **Escolas**                  |
| - Criar                      | ✅    | ❌               | ❌              |
| - Listar todas               | ✅    | ❌               | ❌              |
| - Ver própria                | ✅    | ✅               | ❌              |
| - Editar                     | ✅    | ✅ (própria)     | ❌              |
| - Deletar                    | ✅    | ❌               | ❌              |
| **Alunos**                   |
| - Criar                      | ✅    | ✅               | ❌              |
| - Listar                     | ✅    | ✅ (seus alunos) | ❌              |
| - Ver                        | ✅    | ✅ (seus alunos) | ✅ (próprio)    |
| - Editar                     | ✅    | ✅ (seus alunos) | ✅ (próprio)    |
| - Deletar                    | ✅    | ✅ (seus alunos) | ❌              |
| **Simulados**                |
| - Criar                      | ✅    | ✅               | ❌              |
| - Listar                     | ✅    | ✅ (seus)        | ✅ (atribuídos) |
| - Editar                     | ✅    | ✅ (seus)        | ❌              |
| - Deletar                    | ✅    | ✅ (seus)        | ❌              |
| - Realizar                   | ❌    | ❌               | ✅              |
| **Questões**                 |
| - Criar                      | ✅    | ✅               | ❌              |
| - Ver biblioteca             | ✅    | ✅               | ❌              |
| - Editar                     | ✅    | ❌               | ❌              |
| **Resultados**               |
| - Ver todos                  | ✅    | ❌               | ❌              |
| - Ver por escola             | ✅    | ✅ (seus alunos) |
| <parameter name="content">❌ |
| - Ver próprios               | ✅    | ✅               | ✅              |
| Analytics                    |
| - Globais                    | ✅    | ❌               | ❌              |
| - Por escola                 | ✅    | ✅ (própria)     | ❌              |
| - Pessoais                   | ✅    | ✅               | ✅              |

Implementação de Middleware
typescript// Exemplo de verificação de permissão
const checkPermission = (resource: string, action: string) => {
return (req, res, next) => {
const { role, userId, escolaId } = req.user;

    // Admin tem acesso total
    if (role === 'admin') {
      return next();
    }

    // Escolas só acessam seus próprios recursos
    if (role === 'escola') {
      if (req.params.escolaId !== escolaId) {
        return res.status(403).json({
          error: 'Acesso negado'
        });
      }
      return next();
    }

    // Alunos só acessam seus próprios dados
    if (role === 'aluno') {
      if (req.params.alunoId !== userId) {
        return res.status(403).json({
          error: 'Acesso negado'
        });
      }
      return next();
    }

    return res.status(403).json({
      error: 'Permissão insuficiente'
    });

};
};

🗄️ Modelo de Dados (MongoDB)
Por que MongoDB?
Vantagens para o projeto:

Schema flexível (evolução rápida)
Excelente performance para reads
Suporte nativo a arrays e objetos aninhados
Agregações poderosas para analytics
Escalabilidade horizontal
Integração simples com Node.js via Mongoose

Coleções e Schemas Detalhados

1. Users (Usuários)
   typescriptinterface IUser {
   \_id: ObjectId;
   email: string; // Único, índice
   senha: string; // Hash bcrypt
   role: 'admin' | 'escola' | 'aluno';
   nome: string;
   ativo: boolean;
   emailVerificado: boolean;
   ultimoLogin?: Date;

// Referências baseadas no role
escolaId?: ObjectId; // Se role = escola ou aluno
alunoId?: ObjectId; // Se role = aluno

// Segurança
refreshTokens: string[]; // Tokens ativos
tentativasLogin: number;
bloqueadoAte?: Date;

// Metadata
createdAt: Date;
updatedAt: Date;
}

// Índices
users.createIndex({ email: 1 }, { unique: true });
users.createIndex({ role: 1 });
users.createIndex({ escolaId: 1 }); 2. Escolas
typescriptinterface IEscola {
\_id: ObjectId;

// Dados básicos
nome: string;
nomeFantasia: string;
cnpj: string; // Único

// Contato
email: string;
telefone: string;
site?: string;

// Endereço
endereco: {
cep: string;
logradouro: string;
numero: string;
complemento?: string;
bairro: string;
cidade: string;
estado: string;
pais: string;
};

// Plano e limites
plano: 'basico' | 'premium' | 'enterprise';
limites: {
maxAlunos: number;
maxSimuladosMes: number;
maxQuestoesPersonalizadas: number;
acessoIA: boolean;
whiteLabel: boolean;
apiAccess: boolean;
};

// Faturamento
faturamento: {
valorMensal: number;
diaVencimento: number;
metodoPagamento: string;
status: 'ativo' | 'inadimplente' | 'cancelado';
};

// Configurações
configuracoes: {
logoUrl?: string;
corPrimaria?: string;
corSecundaria?: string;
permitirRanking: boolean;
notificarResponsaveis: boolean;
};

// Responsável
responsavel: {
nome: string;
cpf: string;
email: string;
telefone: string;
};

// Status
ativo: boolean;
dataAtivacao: Date;
dataCancelamento?: Date;

// Metadata
createdAt: Date;
updatedAt: Date;
}

// Índices
escolas.createIndex({ cnpj: 1 }, { unique: true });
escolas.createIndex({ plano: 1 });
escolas.createIndex({ 'faturamento.status': 1 }); 3. Alunos
typescriptinterface IAluno {
\_id: ObjectId;
userId: ObjectId; // Ref: users
escolaId: ObjectId; // Ref: escolas

// Dados pessoais
nome: string;
cpf?: string;
dataNascimento: Date;

// Dados acadêmicos
matricula: string; // Único dentro da escola
turmaAtual?: ObjectId; // Ref: turmas
anoLetivo: number;
cursoPretendido?: string;
universidadePretendida?: string;

// Responsáveis (para menores)
responsaveis?: [{
nome: string;
cpf: string;
email: string;
telefone: string;
parentesco: string;
}];

// Performance
estatisticas: {
totalSimuladosRealizados: number;
mediaGeral: number;
melhorNota: number;
piorNota: number;
tempoMedioProva: number; // em minutos
disciplinasFortes: string[];
disciplinasFracas: string[];
};

// Status
ativo: boolean;

// Metadata
createdAt: Date;
updatedAt: Date;
}

// Índices
alunos.createIndex({ userId: 1 }, { unique: true });
alunos.createIndex({ escolaId: 1, matricula: 1 }, { unique: true });
alunos.createIndex({ turmaAtual: 1 }); 4. Turmas
typescriptinterface ITurma {
\_id: ObjectId;
escolaId: ObjectId; // Ref: escolas

nome: string; // Ex: "3º Ano A"
codigo: string; // Único na escola
ano: number;
periodo: 'matutino' | 'vespertino' | 'noturno' | 'integral';

// Período letivo
dataInicio: Date;
dataFim: Date;

// Alunos
alunos: ObjectId[]; // Refs: alunos
capacidadeMaxima?: number;

// Professores/Coordenadores
professores?: [{
nome: string;
disciplina: string;
email: string;
}];

// Status
ativo: boolean;

// Metadata
createdAt: Date;
updatedAt: Date;
}

// Índices
turmas.createIndex({ escolaId: 1, codigo: 1 }, { unique: true });
turmas.createIndex({ escolaId: 1, ativo: 1 }); 5. Questões
typescriptinterface IQuestao {
\_id: ObjectId;

// Conteúdo
enunciado: string;
alternativas: [{
letra: 'A' | 'B' | 'C' | 'D' | 'E';
texto: string;
imagem?: string; // URL
}];
respostaCorreta: 'A' | 'B' | 'C' | 'D' | 'E';

// Explicação (opcional)
explicacao?: string;
resolucao?: string; // Passo a passo

// Categorização
materia: string; // Matemática, Português, etc
assunto: string; // Geometria, Gramática, etc
subassunto?: string; // Triângulos, Concordância, etc
tags: string[];

// Dificuldade
dificuldade: 'facil' | 'medio' | 'dificil' | 'muito_dificil';
nivelEnem: number; // 1-5

// Origem
origem: {
tipo: 'vestibular' | 'enem' | 'personalizada' | 'gerada_ia';
universidade?: string;
prova?: string;
ano?: number;
fonte?: string; // URL da prova original
};

// Estatísticas de uso
estatisticas: {
vezesUsada: number;
taxaAcerto: number; // Percentual
tempoMedioResposta: number; // Segundos
};

// Imagens/Recursos
imagemEnunciado?: string; // URL
recursosAdicionais?: string[]; // URLs

// Criação
criadaPor?: ObjectId; // Ref: users (se personalizada)
escolaId?: ObjectId; // Se personalizada por escola

// Status
ativo: boolean;
validada: boolean; // Revisão de qualidade

// Metadata
createdAt: Date;
updatedAt: Date;
}

// Índices
questoes.createIndex({ materia: 1, assunto: 1 });
questoes.createIndex({ dificuldade: 1 });
questoes.createIndex({ 'origem.tipo': 1, 'origem.universidade': 1 });
questoes.createIndex({ escolaId: 1 });
questoes.createIndex({ ativo: 1, validada: 1 }); 6. Simulados
typescriptinterface ISimulado {
\_id: ObjectId;
escolaId: ObjectId; // Ref: escolas

// Informações básicas
titulo: string;
descricao?: string;
instrucoes?: string;

// Questões
questoes: [{
questaoId: ObjectId; // Ref: questoes
ordem: number;
peso: number; // Para cálculo de nota
}];

// Configurações
duracao: number; // Minutos
notaMaxima: number;
notaMinima: number;

// Tipo de simulado
tipo: 'diagnostico' | 'regular' | 'vestibular' | 'enem';
modelo: 'linear' | 'adaptativo'; // Futuro: questões adaptam por desempenho

// Disponibilidade
dataLiberacao: Date;
dataExpiracao: Date;
tentativasPermitidas: number; // 1 = uma vez, 0 = ilimitado

// Público-alvo
turmas: ObjectId[]; // Refs: turmas
alunosEspecificos?: ObjectId[]; // Se não for para turma toda

// Configurações de visualização
mostrarGabaritoAposFinalizacao: boolean;
mostrarNotaImediatamente: boolean;
permitirRevisao: boolean;
mostrarRanking: boolean;

// IA (se gerado por IA)
geradoPorIA: boolean;
parametrosIA?: {
prompt: string;
modelo: string;
dificuldadeMedia: string;
focoMaterias: string[];
};

// Estatísticas
estatisticas: {
totalRealizacoes: number;
mediaNotas: number;
menorNota: number;
maiorNota: number;
taxaAbandono: number; // Percentual
tempoMedio: number; // Minutos
};

// Status
status: 'rascunho' | 'ativo' | 'encerrado' | 'arquivado';

// Metadata
criadoPor: ObjectId; // Ref: users
createdAt: Date;
updatedAt: Date;
}

// Índices
simulados.createIndex({ escolaId: 1, status: 1 });
simulados.createIndex({ dataLiberacao: 1, dataExpiracao: 1 });
simulados.createIndex({ turmas: 1 }); 7. Resultados
typescriptinterface IResultado {
\_id: ObjectId;
simuladoId: ObjectId; // Ref: simulados
alunoId: ObjectId; // Ref: alunos
escolaId: ObjectId; // Ref: escolas

// Respostas
respostas: [{
questaoId: ObjectId;
ordem: number;
respostaMarcada: 'A' | 'B' | 'C' | 'D' | 'E' | null;
respostaCorreta: 'A' | 'B' | 'C' | 'D' | 'E';
correta: boolean;
pontos: number;
tempoResposta: number; // Segundos
marcadaRevisao: boolean;
}];

// Resultados gerais
notaFinal: number;
percentualAcerto: number;
questoesCorretas: number;
questoesIncorretas: number;
questoesEmBranco: number;

// Desempenho por categoria
desempenhoPorMateria: [{
materia: string;
totalQuestoes: number;
acertos: number;
percentual: number;
}];

// Tempo
tempoTotal: number; // Minutos
iniciadoEm: Date;
finalizadoEm?: Date;
pausas?: [{
inicio: Date;
fim: Date;
}];

// Status
status: 'iniciado' | 'em_andamento' | 'finalizado' | 'abandonado';
tentativa: number; // Qual tentativa (se permitir múltiplas)

// Comparações
posicaoRanking?: number;
percentilTurma?: number; // Top X%

// Metadata
createdAt: Date;
updatedAt: Date;
}

// Índices
resultados.createIndex({ simuladoId: 1, alunoId: 1 });
resultados.createIndex({ escolaId: 1 });
resultados.createIndex({ alunoId: 1, finalizadoEm: -1 });
resultados.createIndex({ simuladoId: 1, notaFinal: -1 }); // Para ranking

🎨 Interface do Usuário (Material-UI)
Por que Material-UI?
Vantagens Técnicas

Componentização Completa: +50 componentes prontos
Acessibilidade: WCAG 2.1 Level AA compliant
Responsividade: Sistema de grid flexível
Theming: Customização profunda de cores, tipografia, espaçamentos
TypeScript: Tipos completos e inferência automática
Performance: Tree-shaking automático
Documentação: Extensa com exemplos interativos

Vantagens para o Negócio

Time-to-Market: Desenvolvimento 3x mais rápido
Consistência: Design system unificado
White-Label: Fácil customização por escola
Manutenibilidade: Código padronizado
Acessibilidade: Compliance legal garantido

Sistema de Theming
Tema Base
typescriptimport { createTheme } from '@mui/material/styles';

const theme = createTheme({
palette: {
primary: {
main: '#1976d2',
light: '#42a5f5',
dark: '#1565c0',
contrastText: '#fff',
},
secondary: {
main: '#9c27b0',
light: '#ba68c8',
dark: '#7b1fa2',
contrastText: '#fff',
},
error: {
main: '#d32f2f',
},
warning: {
main: '#ed6c02',
},
info: {
main: '#0288d1',
},
success: {
main: '#2e7d32',
},
background: {
default: '#f5f5f5',
paper: '#ffffff',
},
},
typography: {
fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
h1: {
fontSize: '2.5rem',
fontWeight: 500,
},
h2: {
fontSize: '2rem',
fontWeight: 500,
},
h3: {
fontSize: '1.75rem',
fontWeight: 500,
},
body1: {
fontSize: '1rem',
},
},
shape: {
borderRadius: 8,
},
spacing: 8, // Base: 8px
});
Tema Por Role (Exemplo)
typescript// Admin Theme - Azul profissional
const adminTheme = createTheme({
palette: {
primary: { main: '#1565c0' },
secondary: { main: '#424242' },
},
});

// Escola Theme - Verde educação
const escolaTheme = createTheme({
palette: {
primary: { main: '#2e7d32' },
secondary: { main: '#1976d2' },
},
});

// Aluno Theme - Roxo engajamento
const alunoTheme = createTheme({
palette: {
primary: { main: '#7b1fa2' },
secondary: { main: '#f57c00' },
},
});
Componentes Chave

1. Layout Components
   typescript// AppBar (Navbar)
   <AppBar position="fixed">
   <Toolbar>
   <Typography variant="h6">
   Plataforma Simulados
   </Typography>
   <Box sx={{ flexGrow: 1 }} />
   <IconButton color="inherit">
   <NotificationsIcon />
   </IconButton>
   <Avatar src={user.avatar} />
   </Toolbar>
   </AppBar>

// Drawer (Sidebar)
<Drawer variant="permanent">
<List>
<ListItem button>
<ListItemIcon><DashboardIcon /></ListItemIcon>
<ListItemText primary="Dashboard" />
</ListItem>
</List>
</Drawer> 2. Data Display
typescript// Cards
<Card>
<CardHeader
avatar={<Avatar>A</Avatar>}
title="Simulado ENEM 2024"
subheader="Matemática e Linguagens"
/>
<CardContent>
<Typography variant="body2">
45 questões • 4 horas
</Typography>
</CardContent>
<CardActions>
<Button size="small">Iniciar</Button>
</CardActions>
</Card>

// Tables
<TableContainer component={Paper}>

  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Nome</TableCell>
        <TableCell>Nota</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {dados.map((row) => (
        <TableRow key={row.id}>
          <TableCell>{row.nome}</TableCell>
          <TableCell>{row.nota}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
3. Forms
typescript// TextField
<TextField
  fullWidth
  label="Email"
  variant="outlined"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={!!errors.email}
  helperText={errors.email}
/>

// Select
<FormControl fullWidth>
<InputLabel>Dificuldade</InputLabel>
<Select
value={dificuldade}
onChange={(e) => setDificuldade(e.target.value)}

>

    <MenuItem value="facil">Fácil</MenuItem>
    <MenuItem value="medio">Médio</MenuItem>
    <MenuItem value="dificil">Difícil</MenuItem>

  </Select>
</FormControl>

// Autocomplete
<Autocomplete
multiple
options={materias}
getOptionLabel={(option) => option.nome}
renderInput={(params) => (
<TextField {...params} label="Matérias" />
)}
/> 4. Feedback
typescript// Snackbar (Notificações)
<Snackbar
open={open}
autoHideDuration={6000}
onClose={handleClose}

>   <Alert severity="success">

    Simulado criado com sucesso!

  </Alert>
</Snackbar>

// Dialog (Modais)

<Dialog open={open} onClose={handleClose}>
  <DialogTitle>Confirmar Exclusão</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Tem certeza que deseja excluir este aluno?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancelar</Button>
    <Button onClick={handleDelete} color="error">
      Excluir
    </Button>
  </DialogActions>
</Dialog>
Layouts Responsivos
Grid System
typescript<Grid container spacing={3}>
  <Grid item xs={12} md={6} lg={4}>
    <Card>Stats Card 1</Card>
  </Grid>
  <Grid item xs={12} md={6} lg={4}>
    <Card>Stats Card 2</Card>
  </Grid>
  <Grid item xs={12} md={6} lg={4}>
    <Card>Stats Card 3</Card>
  </Grid>
</Grid>
Breakpoints

xs: 0px (mobile)
sm: 600px (tablet portrait)
md: 900px (tablet landscape)
lg: 1200px (desktop)
xl: 1536px (large desktop)

🚀 Roadmap de Desenvolvimento
FASE 1: MVP - Fundação (Mês 1-2) ✅ ATUAL
Objetivos
Estabelecer base sólida do sistema com autenticação completa e gestão básica de usuários.
Entregas
Semana 1-2: Setup e Infraestrutura

Configuração do monorepo com Yarn workspaces
Setup Vite + React + TypeScript
Configuração Material-UI com tema base
Setup Node + Express + TypeScript
Conexão MongoDB + Mongoose
Estrutura de pastas completa
Configuração ESLint + Prettier
Git hooks (Husky)

Semana 3-4: Autenticação

Modelo User (MongoDB)
Registro de usuários
Login com JWT
Refresh token
Logout
Recuperação de senha
Middleware de autenticação
Middleware de autorização (RBAC)

Semana 5-6: Gestão de Usuários Admin

Modelo Escola
CRUD de Escolas (Admin)
Dashboard Admin
Lista de escolas com filtros
Cadastro de escola
Edição de escola
Ativação/desativação de contas

Semana 7-8: Gestão de Usuários Escola

Modelo Aluno
Modelo Turma
CRUD de Alunos (Escola)
CRUD de Turmas (Escola)
Dashboard Escola
Import CSV de alunos
Associação aluno-turma

Métricas de Sucesso

Sistema de login funcional 3 tipos de usuário
Admin consegue gerenciar escolas
Escola consegue gerenciar alunos
Testes unitários >70% cobertura
Deploy em Vercel funcionando

FASE 2: Gestão de Conteúdo (Mês 3)
Objetivos
Criar biblioteca de questões e permitir gestão manual de conteúdo.
Entregas
Semana 9-10: Questões

Modelo Questao
CRUD de Questões (Admin)
Upload de imagens (S3/Cloudinary)
Biblioteca de questões com busca
Filtros (matéria, dificuldade, origem)
Preview de questões
Importação manual de provas (PDF)

Semana 11-12: Questões Personalizadas

Escola pode criar questões próprias
Editor de questões (WYSIWYG)
Versionamento de questões
Validação de qualidade
Tags e categorização
Estatísticas de uso

Métricas de Sucesso

100+ questões cadastradas
Sistema de busca eficiente (<1s)
Escola consegue criar questões personalizadas

FASE 3: Simulados (Mês 4-5)
Objetivos
Permitir criação e realização de simulados.
Entregas
Semana 13-15: Criação de Simulados

Modelo Simulado
Criação manual de simulados
Seleção de questões da biblioteca
Configuração de parâmetros
Agendamento de provas
Atribuição a turmas/alunos
Preview do simulado

Semana 16-18: Realização de Simulados

Interface de prova (Aluno)
Timer visual
Navegação entre questões
Marcação para revisão
Auto-save (rascunho)
Finalização de prova
Modelo Resultado
Cálculo de nota

Semana 19-20: Resultados e Gabaritos

Visualização de resultados
Gabarito detalhado
Revisão de respostas
Comparação com média
Exportação de resultados

Métricas de Sucesso

10+ escolas beta testando
100+ simulados realizados
Taxa de conclusão >80%
Tempo médio de resposta <24h após finalização

FASE 4: IA Generativa (Mês 6-7)
Objetivos
Integrar IA para geração automática e inteligente de questões e simulados.
Entregas
Semana 21-23: Integração OpenAI

Setup OpenAI API
Service de geração de questões
Prompt engineering otimizado
Validação de questões geradas
Refinamento iterativo
Cache de respostas

Semana 24-26: Geração de Simulados

Geração automática de simulados
Personalização por nível
Balanceamento de dificuldade
Diversificação de temas
Revisão humana opcional
Histórico de gerações

Semana 27-28: Refinamentos

Analytics de qualidade IA
Feedback loop (melhoria contínua)
A/B testing prompts
Custo-benefício por geração

Métricas de Sucesso

500+ questões geradas por IA
Taxa de aprovação >85%
Custo <R$ 0,50 por questão
NPS >50 para feature

FASE 5: Integrações Externas (Mês 8-9)
Objetivos
Automatizar coleta de provas de vestibulares.
Entregas
Semana 29-31: Web Scraping

Identificação de fontes (FUVEST, UNICAMP, etc)
Scrapers para cada universidade
OCR para PDFs
Extração estruturada de questões
Limpeza e normalização
Schedule automático

Semana 32-34: APIs Públicas

Integração API ENEM
Integração APIs estaduais
Sincronização periódica
Deduplicação de questões
Enriquecimento de metadata

Semana 35-36: Validação e Qualidade

Pipeline de validação
Revisão manual assistida
Correção de erros
Atualização de biblioteca

Métricas de Sucesso

5+ fontes integradas
5.000+ questões automatizadas
Taxa de sucesso >90%
Atualização semanal automática

FASE 6: Analytics Avançado (Mês 10-11)
Objetivos
Fornecer insights profundos de desempenho e aprendizado.
Entregas
Semana 37-39: Dashboard de Analytics

Gráficos de evolução temporal
Análise por matéria/assunto
Identificação de padrões
Comparativos (aluno x turma x escola)
Heatmaps de dificuldade
Recomendações personalizadas

Semana 40-42: Relatórios Automatizados

Relatórios PDF personalizados
Excel com dados detalhados
Envio automático por e-mail
Agendamento de relatórios
Dashboard público (white-label)

Semana 43-44: Machine Learning

Predição de desempenho
Recomendação de questões
Identificação de alunos em risco
Otimização de dificuldade

Métricas de Sucesso

100%
de escolas usando analytics

Tempo médio sessão >10min
Relatórios gerados semanalmente
Taxa de engajamento >70%

FASE 7: Migração AWS (Mês 12)
Objetivos
Preparar infraestrutura para escala enterprise.
Entregas
Semana 45-47: Infraestrutura

Setup AWS (EC2, RDS, S3)
Configuração VPC e Security Groups
Load Balancer (ALB)
Auto Scaling
CloudFront (CDN)
Route53 (DNS)

Semana 48-50: Migração Gradual

Migração de dados (MongoDB Atlas → DocumentDB)
Migração de arquivos (Vercel → S3)
Testes de carga
Rollback plan
Cutover final

Semana 51-52: Observabilidade

CloudWatch monitoring
Alertas e notificações
Logs centralizados (ELK)
APM (New Relic/Datadog)
Dashboards operacionais

Métricas de Sucesso

Downtime <30min durante migração
Latência <200ms (p95)
Disponibilidade >99.9%
Custo <R$ 5.000/mês inicialmente

🔧 Configurações e Variáveis de Ambiente
Frontend (.env)
bash# API
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=30000

# Auth

VITE_JWT_EXPIRATION=7d

# Features

VITE_ENABLE_IA=true
VITE_ENABLE_ANALYTICS=true

# External Services

VITE_GOOGLE_ANALYTICS_ID=
VITE_SENTRY_DSN=

# Upload

VITE_MAX_FILE_SIZE=10485760 # 10MB
VITE_ALLOWED_FILE_TYPES=image/\*,application/pdf

# Environment

VITE_ENV=development
Backend (.env)
bash# Server
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Database

MONGODB_URI=mongodb://localhost:27017/simulados
MONGODB_DB_NAME=simulados_db

# JWT

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Bcrypt

BCRYPT_ROUNDS=10

# OpenAI

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# Email (SendGrid/SES)

EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=
EMAIL_FROM=noreply@plataforma-simulados.com
EMAIL_FROM_NAME=Plataforma Simulados

# Storage (AWS S3 / Cloudinary)

STORAGE_SERVICE=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=simulados-uploads

# Rate Limiting

RATE_LIMIT_WINDOW=15 # minutos
RATE_LIMIT_MAX_REQUESTS=100

# CORS

CORS_ORIGIN=http://localhost:5173,https://app.plataforma-simulados.com

# Logging

LOG_LEVEL=info
LOG_FILE=logs/app.log

# Features

ENABLE_SCRAPING=false
ENABLE_IA_GENERATION=true

# External APIs

ENEM_API_URL=
ENEM_API_KEY=

📊 Métricas e KPIs
Métricas de Negócio
MétricaMeta Mês 3Meta Mês 6Meta Mês 12Escolas Ativas52050Alunos Ativos2502.00010.000Simulados/Mês1001.00010.000MRRR$ 1.500R$ 10.000R$ 50.000Churn Rate<10%<5%<3%NPS>30>50>70
Métricas Técnicas
MétricaMetaUptime>99.5%Latência API (p95)<500msTempo de carregamento<3sTaxa de erro<1%Cobertura de testes>80%
Métricas de Produto
MétricaMetaTaxa de conclusão de simulados>85%Tempo médio de prova90minTaxa de retorno (D7)>60%Questões por simulado30-50Satisfação com IA>4.2/5

🎯 Próximos Passos Imediatos

1. Setup Inicial (Hoje)
   bash# Execute o script de setup
   ./setup.sh
2. Configuração MongoDB (Hoje)

Criar conta MongoDB Atlas (free tier)
Criar cluster
Obter connection string
Adicionar ao .env

3. Primeiro Commit (Hoje)
   bashgit add .
   git commit -m "feat: initial project setup with vite, react, node, and mongodb"
   git push origin main
4. Desenvolvimento Semana 1

Criar modelo User
Implementar rota de registro
Implementar rota de login
Criar componente de Login (MUI)
Testar fluxo completo

📚 Recursos e Referências
Documentação Oficial

React
TypeScript
Material-UI
Express
Mongoose
JWT

Tutoriais Recomendados

React + TypeScript Best Practices
Node.js Security Best Practices
MongoDB Schema Design

Comunidades

Discord: TypeScript Community
Reddit: r/reactjs, r/node
Stack Overflow

Versão: 2.0.0
Última Atualização: Dezembro 2024
Status: 🚧 Em Desenvolvimento Ativo
Próxima Revisão: Final da Fase 1</parameter>

---

efetuar testes om notebook lm e verificar valores de custo e uso de api para uso interno e autonomo
projetar twa(android) e capacitor(ios) - verificar possibilidade de uso com proprio vite(publcando)
possivel projeto para incluir docker

1. Autenticação + RBAC + Gestão de usuários (3 níveis)
   Tarefa Horas
   Cadastro / Login / Logout 10–16h
   JWT + refresh tokens 8–12h
   Recuperar senha 6–8h
   RBAC (roles + permissões) 12–20h
   Tela de login, registro e UI base 10–16h
   Subtotal: 50–70h

2. Painel Administrativo (Web App MUI completo)
   Estrutura base (layout, navbar, sidebar, rotas privadas)

20–30h

Gestão de escolas

CRUD completo, formulários, listagem, paginação
20–35h

Gestão de alunos

25–40h

Gestão de turmas

20–35h

Gestão de simulados

Listar / criar / editar / configurar
50–80h

Gestão de questões

Editor de questão, alternativas, categorias
35–60h

Analytics inicial (gráficos, estatísticas básicas)

25–40h

UI refinada com MUI + design system

20–30h

Subtotal frontend admin: 215–350h

3. Backend Node.js + MongoDB completo
   Estrutura da API (Express, middlewares, logs, erros)

20–30h

Models + validações avançadas

25–40h

Controllers (usuários, escolas, alunos, simulados, questões, resultados)

70–110h

Serviços internos (business logic)

60–100h

Upload de arquivos + PDF parsing

15–25h

Scraping (cheerio) + integração com APIs externas

30–50h

Dashboard de métricas (contadores, agregações)

20–35h

Testes automatizados (10–20%)

30–60h

Subtotal backend: 270–450h

4. IA – geração de questões + fluxos de simulado adaptativo

Esse é o módulo que mais varia entre devs júnior / pleno / sênior.

Orquestração com OpenAI + LangChain

25–50h

Prompt engineering avançado

15–25h

Sistema de geração automática de questões

35–60h

Sistema de simulado adaptativo (nível progressivo do aluno)

40–80h

Biblioteca de 1000 questões (importação + categorização)

20–40h

Subtotal IA: 135–255h

5. Infraestrutura, DevOps e Deploy
   Deploy na Vercel + variáveis de ambiente

6–10h

CI/CD básico

10–20h

Logs, monitoramento, alertas

10–15h

Preparação para AWS (arquitetura + documentação)

10–20h

Subtotal DevOps: 36–65h

📌 TOTAL ESTIMADO
Cenário Horas
Mínimo (sênior muito experiente) ~750h
Realista (mercado) 900–1100h
Complexo (retrabalho / ajustes / júnior) 1200h+

$1,5 google vision acima de 1001

---

💰 Estimativa de custo mensal (após MVP)
Component AWS Estimado
Backend (EC2) R$ 80–R$ 200
MongoDB Atlas R$ 0–R$ 150
S3 + CloudFront R$ 5–R$ 50
API Gateway/Lambda R$ 10–R$ 50
Logs/monitoramento R$ 10–R$ 30

---

Seu projeto — o que importa

Você tem:

✅ Frontend React/Vite
✅ Backend Node/Express
✅ MongoDB
✅ IA OpenAI
✅ Scraping
✅ Users + RBAC
✅ Simulados, dashboards, analytics
✅ Potencial grande escala (escolas, alunos)

Isso muda bastante o que faz sentido.

🧠 HOSTINGER — Quando faz sentido

👉 Se você quer algo barato e simples, por exemplo:

✔ Projeto ainda em MVP
✔ Testes de plataforma
✔ Beta com poucos usuários
✔ Não precisa escalar hoje
✔ Quer apenas um backend Node e frontend simples

💰 Custo estimado (Brasil):

Plano VPS básico: ~R$ 60 – R$ 150/mês

Hospedar Node + Mongo Atlas (separado)

👍 Vantagens

Fácil de configurar

Preço baixo

Painel intuitivo (cPanel)

👎 Desvantagens

Não escalável

Não tem deploy automático sem CI/CD personalizado

Pode precisar de configurações específicas de Node/Express

VR: sem funções serverless

📌 Bom para: MVP, beta, testes internos, aprendizado.

🧠 AWS — Quando é a melhor escolha

👉 Se você pretende:

✔ Escalar para muitas escolas/alunos
✔ Alta disponibilidade
✔ Integrar vários serviços (S3, CloudFront, Lambda, API Gateway)
✔ Arquitetura profissional
✔ Automatizar deploy, logs, monitoramento
✔ Integrar scraping, jobs, filas

🏆 Serviços que você pode usar:

AWS Service Uso
EC2 / ECS / EKS Hospedar backend escalável
S3 Armazenar uploads, imagens, PDFs
CloudFront CDN para frontend
Lambda Funções serverless (OCR, pequenos jobs)
API Gateway Serverless API + autenticação
DocumentDB / Mongo Atlas Mongo gerenciado
RDS Banco relacional (se precisar)
CloudWatch Logs + métricas
ALB Load balancing
Route53 DNS avançado
WAF Segurança

📈 Prós

Escalabilidade real (horizontal/vertical)

Alta performance e redundância

Pagamento por uso

Integra com sistemas de IA, filas, jobs, OCR, etc

Infra global (regiões)

📉 Contras

Mais complexo

Administração mais técnica

Curva de aprendizado

Pode ter custo inicial maior

📌 Excelente para: produção real, escala, clientes pagantes, SaaS profissional.

---

Preço AWS EC2 (São Paulo)

As instâncias mais comuns para seu SaaS:

✅ t3.small — 2 vCPU / 2GB RAM

Bom para MVP, poucos acessos.

💵 Preço on-demand:

~ US$ 0.035 / hora
= US$ 25 / mês
≈ R$ 140 / mês

✅ t3.medium — 2 vCPU / 4GB RAM (mais recomendado para seu SaaS)
💵 Preço on-demand:

~ US$ 0.070 / hora
= US$ 50 / mês
≈ R$ 280 / mês

Esse é o ponto ideal:
✔ roda API
✔ roda workers
✔ roda upload
✔ consegue PDF, imagens, IA leve
✔ melhor custo/benefício

📦 2. Preço do S3 (separado da EC2)

Sim, S3 é independente e você paga só pelo que usa.

📌 Valores:

US$ 0.025 por GB/mês (armazenamento padrão)

US$ 0.0004 por 1.000 requisições GET

US$ 0.005 por 1.000 requisições PUT

💵 Exemplo real:

10 GB de arquivos (PDFs, imagens, provas):
→ US$ 0.25 / mês
≈ R$ 1.40

100.000 requisições no mês:
→ ~ US$ 1.50
≈ R$ 8,00

➡️ S3 é MUITO barato.

🧮 3. Total estimado EC2 + S3
🚀 Cenário ideal para seu SaaS (t3.medium + 10GB S3):
EC2: R$ 280/mês
S3: R$ 10/mês (com folga)
TOTAL: ~ R$ 290/mês

🚗 Cenário mais barato (t3.small + 5GB S3):
EC2: R$ 140/mês
S3: R$ 5/mês
TOTAL: ~ R$ 145/mês

💡 Conclusão Rápida

✔ S3 é separado da EC2

✔ t3.medium (4GB) é o ideal para seu SaaS

✔ Custo total: R$ 280–300/mês

✔ Escala fácil depois (AutoScaling, RDS, etc.)

Se quiser, posso montar:

✅ Arquitetura completa com EC2 + S3 + CloudFront
✅ Docker ou PM2 + Nginx
✅ Deploy automático via GitHub Actions
✅ Arquivo docker-compose para sua API
