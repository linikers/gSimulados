# Documentação do Sistema de Login e Funcionalidades

## Visão Geral do Login Atual

O sistema utiliza autenticação baseada em **JWT (JSON Web Token)**.

### Fluxo de Autenticação

1.  **Frontend:** O usuário insere email e senha em `/login`.
2.  **API:** Valida as credenciais no banco de dados (MongoDB).
3.  **Token:** Se válido, a API retorna um token JWT e os dados do usuário (sem a senha).
4.  **Persistência:** O token é salvo no `localStorage` do navegador e anexado automaticamente ao header `Authorization` de todas as requisições subsequentes via interceptor do axios.

---

## Estrutura de Usuários (Vínculos)

O banco de dados utiliza um esquema de **Herança/Discriminators** no MongoDB. Existe uma coleção `users` base, e perfis específicos estendem este modelo.

### Tipos de Usuário (Roles)

1.  **Admin (`role: 'admin'`)**: Usuário com acesso total.
2.  **Escola (`role: 'escola'`)**: Representa uma instituição de ensino.
    - Possui campos extras: `cnpj`, `nomeEscola`, `endereco`, `telefone`, `logo`.
3.  **Aluno (`role: 'aluno'`)**: Representa o estudante.
    - Possui campos extras: `matricula`, `turmaId`, `escolaId`.

### ⚠️ Situação Atual do Vínculo Aluno-Escola

**No fluxo de cadastro atual (`/register`), o aluno NÃO é vinculado a nenhuma escola.**

- **O Problema:** A tela de cadastro permite que qualquer um crie uma conta e escolha seu perfil ("Aluno", "Escola" ou "Admin") livremente, mas **não solicita** qual é a escola do aluno.
- **Consequência:** O campo `escolaId` no banco de dados fica vazio (`undefined` ou `null`) para novos cadastros feitos pelo site.
- **Solução Necessária (Futura):** O cadastro de alunos deveria ser feito pela própria Escola (na área administrativa da escola) OU o formulário de cadastro público deveria exigir um código de vínculo/seleção de escola.

---

## Funcionalidades por Perfil (Permissões)

As rotas são protegidas pelo componente `AuthGuard` no frontend.

### 🌐 Público (Sem Login)

- Visualizar Home Page e Landing Pages
- Ver Lista de Vestibulares e Detalhes
- Ver informações sobre Mentoria e Planos
- Acessar Página de Login e Cadastro

### 🛡️ Admin

Tem acesso irrestrito a todas as rotas administrativas:

- **Escolas:** Listar e Cadastrar novas escolas.
- **Alunos:** Listar e Cadastrar novos alunos manualmente.
- **Questões:** Cadastrar novas questões no banco.
- **Vestibulares:** Gerenciar lista de vestibulares (CRUD).
- **Banco de Questões:** Configurar integração com Google Drive e processar PDFs.

### 🏫 Escola

Funcionalidades limitadas à própria instituição:

- **Meus Alunos:** Visualizar lista de alunos (atualmente vê todos, mas deveria ver apenas os vinculados ao seu `_id`).
  - _Nota:_ A rota atual `/escola/alunos` aponta para `ListaAlunos`, que precisa ser ajustada no backend para filtrar apenas alunos daquela escola.

### 🎓 Aluno

- Acesso atualmente limitado. (O dashboard redireciona para uma tela de boas-vindas genérica).
- Futuramente terá acesso a simulados, desempenho e materiais exclusivos.
