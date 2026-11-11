import { app } from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/database";
import { GatewayConfigService } from "./services/gateway-config/gateway-config.service";

const port = env.PORT || 3001;

// Sobe o servidor ANTES de conectar ao banco.
// Assim /health responde imediatamente e o health check do Fly não derruba
// a máquina enquanto o Mongo ainda está sendo alcançado.
app.listen(port, () => {
  console.log(`Server rodando na porta ${port}`);
});

// Conecta em background, com retentativas (não encerra o processo).
// Depois de conectar, carrega as credenciais de gateway salvas no painel.
connectDB().then(() => GatewayConfigService.hydrate());

// Evita morte silenciosa do processo por rejeições não tratadas.
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[uncaughtException]", error);
  process.exit(1);
});
