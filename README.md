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
npm install
```

### Rodar Frontend (Desenvolvimento)

```bash
npm run dev:web
```

Ou entre na pasta e rode:

```bash
cd apps/web
npm run dev
```

### Rodar Backend (Desenvolvimento)

```bash
npm run dev:api
```

Ou entre na pasta e rode:

```bash
cd apps/api
npm run dev
```

## Dependências

O backend inclui suporte para:

- MongoDB (Mongoose)
- Autenticação (JWT, Bcrypt)
- IA (OpenAI, LangChain)
- Scraping (Cheerio, PDF-Parse)
