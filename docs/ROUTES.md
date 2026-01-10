# 🗺️ Rotas Disponíveis - Plataforma Simulados

## 📱 Frontend (Web) - `localhost:5173`

### Rotas Públicas

| Rota                       | Descrição                    |
| :------------------------- | :--------------------------- |
| `/`                        | Página Inicial               |
| `/sobre`                   | Sobre o Projeto/Professor    |
| `/aulas-e-mentorias`       | Informações de Mentorias     |
| `/beneficios`              | Benefícios da Plataforma     |
| `/vestibulares`            | Lista de Vestibulares        |
| `/vestibulares/:codigo`    | Detalhes do Vestibular       |
| `/seriados`                | Processos Seriados (PAS/PSS) |
| `/materiais`               | Materiais de Estudo          |
| `/ferramentas`             | Ferramentas de Estudo        |
| `/ferramentas/marketplace` | Marketplace                  |
| `/aprovacoes`              | Hall de Aprovações           |
| `/faq`                     | Perguntas Frequentes (FAQ)   |
| `/login`                   | Página de Login              |
| `/register`                | Página de Registro           |

### Rotas Protegidas (Requer Autenticação)

| Rota         | Descrição           | Acesso |
| :----------- | :------------------ | :----- |
| `/dashboard` | Dashboard Principal | Todos  |

#### Admin Routes

| Rota                           | Descrição                     |
| :----------------------------- | :---------------------------- |
| `/admin/escolas`               | Listar Escolas                |
| `/admin/escolas/cadastro`      | Cadastrar Escola              |
| `/admin/alunos`                | Listar Alunos                 |
| `/admin/alunos/cadastro`       | Cadastrar Aluno               |
| `/admin/questoes/cadastro`     | Cadastrar Questão Manualmente |
| `/admin/vestibulares`          | Gerenciar Vestibulares        |
| `/admin/vestibulares/cadastro` | Criar Novo Vestibular         |
| `/admin/banco-questoes/drive`  | Configurar Google Drive       |
| `/admin/banco-questoes/pdfs`   | Listar/Processar PDFs         |

#### Escola Routes

| Rota             | Descrição               |
| :--------------- | :---------------------- |
| `/escola/alunos` | Listar Alunos da Escola |

---

## 🔌 Backend (API) - `localhost:3001`

### Autenticação

| Método | Endpoint         | Descrição              | Proteção |
| :----- | :--------------- | :--------------------- | :------- |
| `POST` | `/auth/register` | Registrar novo usuário | Pública  |
| `POST` | `/auth/login`    | Login                  | Pública  |

### Escolas

| Método | Endpoint   | Descrição      | Proteção |
| :----- | :--------- | :------------- | :------- |
| `POST` | `/schools` | Criar escola   | Admin    |
| `GET`  | `/schools` | Listar escolas | Admin    |

### Alunos

| Método | Endpoint  | Descrição     | Proteção     |
| :----- | :-------- | :------------ | :----------- |
| `POST` | `/alunos` | Criar aluno   | Admin/Escola |
| `GET`  | `/alunos` | Listar alunos | Admin/Escola |

### Questões & Vestibulares

| Método | Endpoint        | Descrição           | Proteção    |
| :----- | :-------------- | :------------------ | :---------- |
| `POST` | `/questions`    | Criar questão       | Admin       |
| `GET`  | `/questions`    | Listar questões     | Auth        |
| `GET`  | `/vestibulares` | Listar vestibulares | Public/Auth |

### Banco de Questões (Extração)

| Método | Endpoint                       | Descrição           | Proteção |
| :----- | :----------------------------- | :------------------ | :------- |
| `GET`  | `/drive-config`                | Listar config drive | Admin    |
| `POST` | `/drive-config/sync`           | Sincronizar PDFs    | Admin    |
| `GET`  | `/extraction/pdfs`             | Listar Status PDFs  | Admin    |
| `POST` | `/extraction/pdfs/:id/extract` | Iniciar Extração IA | Admin    |

---

## 🔐 Sistema de Autenticação

### Headers Necessários

Para rotas protegidas, incluir:

```
Authorization: Bearer <token_jwt>
```

### Roles (Perfis)

- `admin`: Acesso total ao sistema
- `escola`: Gerencia alunos da própria escola
- `aluno`: Acesso a simulados e resultados próprios

---

## 📝 Notas

- Rotas marcadas como **(placeholder)** estão definidas no menu mas ainda não têm implementação.
- A porta do frontend pode variar (padrão Vite: 5173).
- A porta da API está configurada em `apps/api/.env` (padrão: 3001).

http://localhost:5173/admin/questoes/cadastro
http://localhost:5173/dashboard
