# Plataforma de Simulados

Este projeto utiliza uma estrutura de **Monorepo**.

## Estrutura

- `apps/web`: Frontend (React + Vite)
- `apps/api`: Backend (Node + Express)
- `packages/shared`: Tipos e utilitários compartilhados

## Como rodar o projeto

### Instalação

Na raiz do projeto:

```bash
yarn install
```

### Rodar Frontend (Desenvolvimento)

```bash
yarn workspace @gsimulados/web dev
```

Ou entre na pasta e rode:

```bash
cd apps/web
yarn dev
```

### Rodar Backend (Desenvolvimento)

```bash
yarn workspace @gsimulados/api dev
```

Ou entre na pasta e rode:

```bash
cd apps/api
yarn dev
```

## Dependências

O backend inclui suporte para:

- MongoDB (Mongoose)
- Autenticação (JWT, Bcrypt)
- IA (OpenAI, LangChain)
- Scraping (Cheerio, PDF-Parse)
