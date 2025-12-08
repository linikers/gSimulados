import { app } from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/database";

connectDB();

const port = env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server rodando na porta ${port}`);
});
