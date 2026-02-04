import { Redis } from "ioredis";
import { env } from "./env";

// Configuração da conexão com o Redis
export const redisConfig = {
  connection: new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // Necessário para o BullMQ
  }),
};

console.log(`[Redis] Conectado ao servidor: ${env.REDIS_URL}`);
