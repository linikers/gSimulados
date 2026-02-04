import { pdfExtractionQueue } from "./queues/pdf-extraction.queue";
import { redisConfig } from "./config/redis";

async function verify() {
  console.log("--- Verifying Redis & Queue ---");
  try {
    // 1. Verificar Redis
    const pong = await redisConfig.connection.ping();
    console.log(`Redis Ping: ${pong}`);

    // 2. Tentar adicionar um Job "fake" (ou apenas verificar se a fila responde)
    const jobCount = await pdfExtractionQueue.count();
    console.log(`Jobs na fila: ${jobCount}`);

    console.log("--- Verificação Concluída com Sucesso ---");
    process.exit(0);
  } catch (error) {
    console.error("--- Falha na Verificação ---");
    console.error(error);
    process.exit(1);
  }
}

verify();
