import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import schoolRoutes from "./routes/schools.routes";
import alunosRoutes from "./routes/alunos.routes";
import questionsRoutes from "./routes/questions.routes";
import vestibularesRoutes from "./routes/vestibulares.routes";
import driveConfigRoutes from "./routes/drive-config.routes";
import pdfExtractionRoutes from "./routes/pdf-extraction.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/schools", schoolRoutes);
app.use("/alunos", alunosRoutes);
app.use("/questions", questionsRoutes);
app.use("/vestibulares", vestibularesRoutes);
app.use("/drive-config", driveConfigRoutes);
app.use("/extraction", pdfExtractionRoutes);

app.get("/", (_, res) => {
  res.send("Hello para a API");
});

export { app };
