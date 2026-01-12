# Guia de Deploy e Manutenção no Fly.io

Este guia cobre os passos para realizar o deploy inicial, atualizações (rebuild) e manutenção das aplicações API e Web no Fly.io.

## 🚀 Visão Geral

O projeto é composto por dois serviços no Fly.io:

1. **API** (`gsimulados-api`): Node.js/Express
2. **Web** (`gsimulados-web`): React/Vite (servido via Nginx)

## 📋 Pré-requisitos

- [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) instalado.
- Login realizado: `fly auth login`.

## 🛠️ Primeiro Deploy

### 1. Criar Apps

Se ainda não criou os apps:

```bash
fly apps create gsimulados-api
fly apps create gsimulados-web
```

### 2. Configurar Segredos (API)

A API precisa de variáveis de ambiente sensíveis. Configure-as usando o comando `fly secrets set`:

```bash
fly secrets set -a gsimulados-api \
  MONGO_URI="sua_string_conexao_mongodb" \
  JWT_SECRET="seu_segredo_jwt" \
  CLOUDINARY_CLOUD_NAME="seu_cloud_name" \
  CLOUDINARY_API_KEY="sua_api_key" \
  CLOUDINARY_API_SECRET="sua_api_secret" \
  GEMINI_API_KEY="sua_chave_gemini" \
  GOOGLE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

> **Nota sobre GOOGLE_SERVICE_ACCOUNT**: Cole o JSON completo do service account entre aspas simples. Certifique-se de que a chave privada está no formato correto (com `\n` para quebras de linha).

> **Nota**: Certifique-se de que seu banco de dados (ex: MongoDB Atlas) permite conexões externas (IP `0.0.0.0/0` ou configure peering).

### 3. Deploy da API

```bash
fly deploy --config apps/api/fly.toml
```

### 4. Configurar URL da API no Web

Após o deploy da API, pegue a URL (ex: `https://gsimulados-api.fly.dev`) e atualize o arquivo `apps/web/fly.toml`:

```toml
[build.args]
  VITE_API_URL = "https://gsimulados-api.fly.dev"
```

### 5. Deploy do Web

```bash
fly deploy --config apps/web/fly.toml
```

## 🔄 Como Atualizar (Rebuild)

Sempre que você fizer alterações no código, precisará fazer um novo deploy.

### Atualizar API

```bash
fly deploy --config apps/api/fly.toml
```

### Atualizar Web

```bash
fly deploy --config apps/web/fly.toml
```

> **Dica**: O Dockerfile da API e do Web são configurados para reconstruir automaticamente o pacote compartilhado (`packages/shared`) durante o processo de build.

## 🔍 Monitoramento e Logs

### Ver Logs em Tempo Real

```bash
# API
fly logs -a gsimulados-api

# Web
fly logs -a gsimulados-web
```

### Status das Máquinas

```bash
fly status -a gsimulados-api
fly status -a gsimulados-web
```

## ⚠️ Solução de Problemas Comuns

### Erro de Conexão com Banco de Dados

- Verifique se a `MONGO_URI` está correta nos segredos (`fly secrets list -a gsimulados-api`).
- Verifique a whitelist de IP no MongoDB Atlas.

### Erro de CORS no Frontend

- Verifique se a `VITE_API_URL` no `fly.toml` do Web corresponde exatamente à URL da API (sem barra no final, geralmente).
- A API deve estar configurada para aceitar a origem do frontend (configure o CORS no `server.ts` se necessário).

### "Command not found" (fly)

- Execute `source ~/.bashrc` ou use o caminho completo `~/.fly/bin/flyctl`.
