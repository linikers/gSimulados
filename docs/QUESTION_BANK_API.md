# 🧠 Documentação do Banco de Questões

## Visão Geral

O módulo de Banco de Questões permite o gerenciamento (CRUD) de questões de múltipla escolha classificadas por metadados ricos, permitindo a futura geração automática de simulados.

## 🗄️ Modelo de Dados (`Question`)

Arquivo: `apps/api/src/models/Question.ts`

| Campo               | Tipo     | Obrigatório | Descrição                          |
| :------------------ | :------- | :---------: | :--------------------------------- |
| `enunciado`         | String   |     Sim     | Texto da questão (html/markdown)   |
| `alternativas`      | Array[5] |     Sim     | Lista de 5 strings (A, B, C, D, E) |
| `respostaCorreta`   | Enum     |     Sim     | "A", "B", "C", "D" ou "E"          |
| `materia`           | String   |     Sim     | Ex: "Matemática", "História"       |
| `assunto`           | String   |     Sim     | Ex: "Geometria", "Era Vargas"      |
| `dificuldade`       | Enum     |     Sim     | "facil", "medio", "dificil"        |
| `origem`            | Object   |     Sim     | Dados da prova original            |
| `origem.vestibular` | String   |     Sim     | Ex: "UEM", "ENEM"                  |
| `origem.ano`        | Number   |     Sim     | Ex: 2023                           |
| `tags`              | Array    |     Não     | Tags para busca                    |

## 🎮 Controller (`QuestionsController`)

Arquivo: `apps/api/src/controllers/questions.controller.ts`

### Métodos Implementados

1.  **`create(req, res)`**

    - Recebe o JSON da questão e salva no MongoDB.
    - Valida se existem exatamente 5 alternativas.

2.  **`list(req, res)`**

    - Retorna lista de questões ordenadas por data de criação (mais recentes primeiro).
    - **Filtros (Query Params):**
      - `?materia=Matemática`
      - `?dificuldade=dificil`
      - `?vestibular=UEM`

3.  **`getById(req, res)`**

    - Busca uma única questão pelo ID.

4.  **`delete(req, res)`**
    - Remove uma questão pelo ID.

## 🛣️ Rotas (`questions.routes.ts`)

Arquivo: `apps/api/src/routes/questions.routes.ts`
Prefixo: `/questions`

| Método   | Endpoint | Protegido? | Ação                          |
| :------- | :------- | :--------: | :---------------------------- |
| `POST`   | `/`      |    Sim     | Criar nova questão            |
| `GET`    | `/`      |    Sim     | Listar questões (com filtros) |
| `GET`    | `/:id`   |    Sim     | Obter detalhes da questão     |
| `DELETE` | `/:id`   |    Sim     | Deletar questão               |

**Obs:** Todas as rotas exigem autenticação (`authMiddleware`).

## 🔍 Exemplo de JSON para Criação

```json
{
  "enunciado": "Qual a capital da França?",
  "alternativas": ["Londres", "Paris", "Berlim", "Madrid", "Lisboa"],
  "respostaCorreta": "B",
  "materia": "Geografia",
  "assunto": "Capitais",
  "dificuldade": "facil",
  "origem": {
    "vestibular": "ENEM",
    "ano": 2020
  }
}
```
