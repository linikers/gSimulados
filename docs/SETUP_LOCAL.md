# Setup Local - Redis & MongoDB

## Opção 1: Docker Desktop (Recomendado)

Se você tem Docker Desktop instalado:

```powershell
# Abra um novo terminal PowerShell como Administrador
docker compose up -d

# Verificar se os serviços estão rodando
docker compose ps

# Ver logs
docker compose logs -f

# Parar os serviços
docker compose down
```

## Opção 2: Redis apenas (Windows)

Se preferir instalar Redis diretamente no Windows:

1. Baixe Redis para Windows: https://github.com/tporadowski/redis/releases
2. Extraia e execute `redis-server.exe`

## Opção 3: WSL2

Se tem WSL2 configurado:

```bash
# Dentro do WSL
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

## Verificação

Após iniciar o Redis, reinicie a aplicação:

```powershell
# Parar yarn dev atual (Ctrl+C)
yarn dev
```

Você deve ver:

```
[Redis] ✅ Conectado ao servidor: redis://localhost:6379
[Server] Worker de extração inicializado.
```

## Troubleshooting

**Docker não iniciado?**

- Abra o Docker Desktop manualmente
- Aguarde até ele aparecer na bandeja do sistema
- Tente `docker compose up -d` novamente

**PowerShell não encontra Docker?**

- Reinicie o terminal PowerShell
- Ou use "Docker Desktop PowerShell" do menu Iniciar
