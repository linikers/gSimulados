import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { connectDB } from "./config/database";
import authRoutes from "./routes/auth.routes";

connectDB();

const app = express();
const port = env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hello from API");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
