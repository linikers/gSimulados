import { app } from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/database";
import { setupPdfExtractionWorker } from "./workers/pdf-extraction.worker";
import { redisConnection } from "./config/redis";

connectDB();

// Inicia o Worker apenas se o Redis estiver disponível
redisConnection
  .connect()
  .then(() => {
    setupPdfExtractionWorker();
    console.log("[Server] Worker de extração inicializado.");
  })
  .catch((err) => {
    console.warn(
      "[Server] ⚠️  Redis indisponível. Worker de extração desabilitado.",
      err.message,
    );
    console.warn("[Server] Execute: docker run -d -p 6379:6379 redis");
  });

const port = env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server rodando na porta ${port}`);
});
