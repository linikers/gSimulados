import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import schoolRoutes from "./routes/schools.routes";
import alunosRoutes from "./routes/alunos.routes";
import questionsRoutes from "./routes/questions.routes";
import vestibularesRoutes from "./routes/vestibulares.routes";
import driveConfigRoutes from "./routes/drive-config.routes";
import pdfExtractionRoutes from "./routes/pdf-extraction.routes";
import simuladoRoutes from "./routes/simulados.routes";
import pagamentosRoutes from "./routes/pagamentos.routes";
import gatewaysRoutes from "./routes/gateways.routes";
import webhooksRoutes from "./routes/webhooks.routes";
import { dbReady } from "./config/database";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware";

const app = express();

// No Fly, a conexão chega pelo proxy da plataforma. Sem isto o `req.ip` é o IP
// interno do proxy e TODO mundo cai no mesmo balde do rate limit — 10 erros de
// senha de um aluno bloqueariam o login de todos.
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/schools", schoolRoutes);
app.use("/alunos", alunosRoutes);
app.use("/questions", questionsRoutes);
app.use("/vestibulares", vestibularesRoutes);
app.use("/drive-config", driveConfigRoutes);
app.use("/extraction", pdfExtractionRoutes);
app.use("/simulados", simuladoRoutes);
app.use("/pagamentos", pagamentosRoutes);
app.use("/admin/gateways", gatewaysRoutes);
app.use("/webhooks", webhooksRoutes);

app.get("/", (_, res) => {
  res.send("Hello para a API");
});

// Liveness: o processo está vivo (usado pelo health check do Fly).
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Readiness: o processo consegue atender requisições que dependem do banco.
app.get("/ready", (_req, res) => {
  const ok = dbReady();
  res.status(ok ? 200 : 503).json({
    status: ok ? "ready" : "unavailable",
    mongo: ok ? "connected" : "disconnected",
  });
});

// Depois de TODAS as rotas (inclusive / e /health): 404 em JSON e um único
// tradutor de erro (Express 5 encaminha rejeição de async para cá).
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
