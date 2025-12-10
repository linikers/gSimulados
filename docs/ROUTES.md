# 🗺️ Rotas Disponíveis - Plataforma Simulados

## 📱 Frontend (Web) - `localhost:5173`

### Rotas Públicas

| Rota        | Descrição          |
| :---------- | :----------------- |
| `/`         | Página de Login    |
| `/register` | Página de Registro |

### Rotas Protegidas (Requer Autenticação)

| Rota         | Descrição           | Acesso |
| :----------- | :------------------ | :----- |
| `/dashboard` | Dashboard Principal | Todos  |

| `/escola/alunos` | Lista de Alunos da Escola | Escola |
| `/escola/turmas` | Turmas (placeholder) | Escola |
| `/escola/simulados` | Simulados (placeholder) | Escola |
| `/escola/relatorios` | Relatórios (placeholder) | Escola |

### Rotas de Aluno

| Rota                | Descrição                     | Acesso |
| :------------------ | :---------------------------- | :----- |
| `/aluno/simulados`  | Meus Simulados (placeholder)  | Aluno  |
| `/aluno/resultados` | Meus Resultados (placeholder) | Aluno  |
| `/aluno/desempenho` | Meu Desempenho (placeholder)  | Aluno  |

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
