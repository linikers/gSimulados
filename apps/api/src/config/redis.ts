import { Redis } from "ioredis";
import { env } from "./env";

// Configuração da conexão com o Redis
export const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Necessário para o BullMQ
  lazyConnect: true, // Não conecta automaticamente
  retryStrategy: (times) => {
    if (times > 3) {
      console.error(
        "[Redis] ❌ Falha ao conectar. Verifique se o Redis está rodando.",
      );
      return null; // Parar de tentar
    }
    return Math.min(times * 200, 2000);
  },
});

redisConnection.on("connect", () => {
  console.log(`[Redis] ✅ Conectado ao servidor: ${env.REDIS_URL}`);
});

redisConnection.on("error", (err) => {
  console.error(`[Redis] ⚠️  Erro de conexão: ${err.message}`);
});

export const redisConfig = {
  connection: redisConnection,
};
