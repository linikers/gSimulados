import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { User } from "../models/User";

/**
 * Cria um usuário administrador.
 *
 * Uso:
 *   yarn workspace @gsimulados/api create-admin <nome> <email> <senha>
 *
 * Necessário porque o cadastro público não permite criar 'admin'
 * (apenas 'aluno' e 'escola').
 */
async function main() {
  const [name, email, password] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.error(
      "Uso: yarn workspace @gsimulados/api create-admin <nome> <email> <senha>",
    );
    process.exit(1);
  }

  await mongoose.connect(env.MONGO_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    console.error(
      `Já existe usuário com o email ${email} (perfil: ${existing.role}).`,
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "admin",
  });

  console.log(`✅ Admin criado: ${admin.email} (id: ${admin._id})`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("❌ Falha ao criar admin:", error);
  process.exit(1);
});
