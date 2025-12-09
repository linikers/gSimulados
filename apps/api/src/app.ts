import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import schoolRoutes from "./routes/schools.routes";
import alunosRoutes from "./routes/alunos.routes";

import questionsRoutes from "./routes/questions.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/schools", schoolRoutes);
app.use("/alunos", alunosRoutes);
app.use("/questions", questionsRoutes);

app.get("/", (_, res) => {
  res.send("Hello para a API");
});

export { app };
