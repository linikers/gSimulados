import mongoose from "mongoose";
import { env } from "./env";

const MAX_TENTATIVAS = 10;
const INTERVALO_MS = 5000;

export const connectDB = async (): Promise<void> => {
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      const conn = await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`MongoDB conectado: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(
        `Erro ao conectar no MongoDB (tentativa ${tentativa}/${MAX_TENTATIVAS}):`,
        (error as Error).message,
      );
      if (tentativa < MAX_TENTATIVAS) {
        await new Promise((resolve) => setTimeout(resolve, INTERVALO_MS));
      }
    }
  }

  // NÃO derruba o processo: a API continua no ar respondendo /health e
  // devolvendo 503 nas rotas que dependem do banco. Antes, process.exit(1)
  // aqui causava crash-loop e 502 no proxy do Fly.
  console.error(
    "Não foi possível conectar ao MongoDB após todas as tentativas. " +
      "A API segue no ar; verifique a connection string e a allowlist de IP do Atlas.",
  );
};

/** Indica se a conexão com o Mongo está pronta para uso. */
export const dbReady = (): boolean => mongoose.connection.readyState === 1;
