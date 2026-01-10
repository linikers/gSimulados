# 🐳 Documentação do Ambiente Docker

## Visão Geral

O projeto utiliza **Docker** para containerização, permitindo uma implantação consistente e isolada. Existem dois ambientes principais containerizados:

1.  **Frontend (`apps/web`)**: Servido via Nginx.
2.  **Backend (`apps/api`)**: Executado em ambiente Node.js.

## Estrutura dos Dockerfiles

### 1. Frontend (`apps/web/Dockerfile`)

- **Base:** `node:20-alpine` (Build) -> `nginx:alpine` (Runtime).
- **Processo:**
  1. Instala dependências do monorepo.
  2. Compila o pacote compartilhado (`packages/shared`).
  3. Compila a aplicação Web (`apps/web`).
  4. Copia os arquivos estáticos gerados para o Nginx.
- **Porta Exposta:** `80`.

### 2. Backend (`apps/api/Dockerfile`)

- **Base:** `node:20-alpine`.
- **Processo:**
  1. Instala dependências.
  2. Compila o pacote compartilhado.
  3. Compila a API.
  4. Prepara uma imagem leve apenas com os arquivos de produção (`dist` + `node_modules`).
- **Porta Exposta:** `3001`.

## Como Construir e Rodar (Manual)

Como o projeto utiliza um monorepo (Yarn Workspaces), o contexto de build deve ser sempre a **raiz do repositório**.

### Building da API

```bash
# Na raiz do projeto
docker build -f apps/api/Dockerfile -t gsimulados-api .
```

**Rodando a API:**

```bash
docker run -p 3001:3001 --env-file apps/api/.env gsimulados-api
```

### Building do Frontend

É necessário passar a URL da API durante o build para que o Vite configure as chamadas corretamente.

```bash
# Na raiz do projeto
docker build -f apps/web/Dockerfile --build-arg VITE_API_URL=http://localhost:3001 -t gsimulados-web .
```

**Rodando o Frontend:**

```bash
docker run -p 8080:80 gsimulados-web
```

(Acesse em `http://localhost:8080`)

## Docker Compose (Recomendado para Futuro)

Atualmente não há um arquivo `docker-compose.yml` na raiz, mas seria a evolução natural para orquestrar os dois serviços e o banco de dados simultaneamente.

Exemplo de estrutura sugerida:

```yaml
services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports: ["3001:3001"]
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports: ["80:80"]
```
