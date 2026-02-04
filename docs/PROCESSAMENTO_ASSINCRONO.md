# Processamento Assíncrono de PDF

Este documento descreve a arquitetura e o funcionamento do sistema de processamento de PDFs em segundo plano do `gSimulados`.

## Arquitetura

Para evitar timeouts e garantir a estabilidade da API durante a extração pesada de dados via IA, implementamos um modelo de mensageria utilizando:

- **Fila (Queue)**: [BullMQ](https://docs.bullmq.io/), rodando sobre o **Redis**.
- **Worker**: Um processo que consome a fila e executa a lógica de extração de forma isolada do fluxo principal da aplicação.

## Componentes

### 1. Configuração do Redis

Localizado em `src/config/redis.ts`, gerencia a conexão com o servidor Redis através da biblioteca `ioredis`.

### 2. A Fila (Queue)

Definida em `src/queues/pdf-extraction.queue.ts`. É aqui que o backend "despacha" novas tarefas de extração.

### 3. O Worker

Localizado em `src/workers/pdf-extraction.worker.ts`.

- **Concorrência**: Configurado para processar até 2 PDFs por vez.
- **Resiliência**: Possui retentativas exponenciais automáticas em caso de falha (ex: limite de taxa da API do Gemini).
- **Lógica**: Realiza o download do PDF do Google Drive, envia para o Gemini Vision, sanitiza os dados e salva na coleção `ExtractedQuestion`.

### 4. Controller (Producer)

O `PdfExtractionController.ts` atua como produtor, enfileirando o trabalho ao receber uma requisição de extração.

## Variáveis de Ambiente

É necessário configurar o acesso ao Redis:

- `REDIS_URL`: URL de conexão (Ex: `redis://localhost:6379`).

## Como Testar / Validar

1. Garanta que o Redis esteja ativo.
2. Inicie a aplicação (`yarn dev`).
3. Ao solicitar uma extração no frontend, verifique os logs:
   - `[Queue] Adicionando PDF ... à fila`
   - `[Worker] Iniciando processamento do PDF ...`
   - `[Worker] Extração concluída com sucesso`

---

_Nota: Embora atualmente o Worker inicie no mesmo processo da API (`server.ts`), ele foi desenhado de forma modular para ser facilmente separado em um microserviço ou container dedicado (AWS ECS/Fargate) no futuro._
