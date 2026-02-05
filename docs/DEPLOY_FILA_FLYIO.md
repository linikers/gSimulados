# Deploy no Fly.io com Redis

Este guia descreve como configurar Redis no Fly.io para o processamento assíncrono de PDFs.

## Opção 1: Upstash Redis (Recomendado - Free Tier Disponível)

[Upstash](https://upstash.com/) oferece Redis serverless com free tier generoso.

### Passos:

1. Crie uma conta no Upstash: https://console.upstash.com/
2. Crie um novo Redis Database (região: **US East** para menor latência com Fly.io)
3. Copie a **REST URL** ou **Redis URL**
4. Configure no Fly.io:

```bash
fly secrets set REDIS_URL="redis://default:SEU_PASSWORD@SEU_HOST.upstash.io:6379" -a gsimulados-api
```

**Vantagens:**

- Free tier: 10K comandos/dia
- Serverless (paga pelo uso)
- Baixa latência com Fly.io
- Sem gerenciamento de infraestrutura

---

### Problemas Comuns:

Se o comando `fly redis create` não for reconhecido ou der erro de "unknown command":

1. **Atualize o flyctl**: No Windows, rode o comando abaixo no PowerShell:
   ```powershell
   iwr https://fly.io/install.ps1 -useb | iex
   ```
2. **Login**: Verifique se está logado:
   ```bash
   fly auth login
   ```
3. **Alternativa via Dashboard**:
   Você também pode criar o Redis diretamente pelo navegador em: [https://fly.io/dashboard](https://fly.io/dashboard) -> selecione sua Org -> **Redis** -> **Create Redis Database**.

---

## Opção 2: Fly.io Redis Addon

O Fly.io oferece Redis gerenciado (via Upstash) integrado na mesma infraestrutura.

**Vantagens:**

- Mesma infraestrutura (menor latência)
- Gerenciamento simplificado
- Integração automática

**Desvantagens:**

- Custo mensal (~$3-5/mês para instâncias pequenas)

---

## Verificação

Após configurar, faça deploy e verifique os logs:

```bash
fly logs -a gsimulados-api
```

Procure por:

```
[Redis] ✅ Conectado ao servidor: redis://...
[Server] Worker de extração inicializado.
```

---

## Desenvolvimento Local

Para desenvolvimento, use o Docker Compose:

```bash
# Iniciar Redis e MongoDB localmente
docker-compose up -d

# Verificar se estão rodando
docker-compose ps

# Parar os serviços
docker-compose down
```

A aplicação está configurada para funcionar mesmo sem Redis (com degradação de funcionalidade), mas **em produção o Redis é obrigatório** para a extração assíncrona de PDFs.
