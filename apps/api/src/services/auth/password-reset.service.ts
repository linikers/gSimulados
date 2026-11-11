import crypto from "crypto";
import bcrypt from "bcryptjs";
import { PasswordReset } from "../../models/PasswordReset";
import { User } from "../../models/User";
import { RefreshTokenService } from "./refresh-token.service";
import { EmailService } from "../email/email.service";
import { templateResetSenha } from "../email/templates";

const VALIDADE_MS = 60 * 60 * 1000; // 1 hora

function hash(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function escaparRegex(valor: string): string {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function baseUrl(): string {
  return (
    process.env.WEB_URL?.trim().replace(/\/+$/, "") ||
    "https://gsimulados-web.fly.dev"
  );
}

export class PasswordResetService {
  /**
   * Sempre resolve — o controller responde igual exista ou não o e-mail (não
   * dá para usar a tela para descobrir quem tem conta).
   */
  static async solicitar(email: string): Promise<void> {
    const normalizado = email.trim().toLowerCase();
    const usuario = await User.findOne({
      email: new RegExp(`^${escaparRegex(normalizado)}$`, "i"),
    });
    if (!usuario) return;

    // Só o último link vale: pedidos anteriores são queimados.
    await PasswordReset.updateMany(
      { usuario: usuario._id, usadoEm: { $exists: false } },
      { $set: { usadoEm: new Date() } },
    );

    const token = crypto.randomBytes(32).toString("base64url");
    await PasswordReset.create({
      usuario: usuario._id,
      tokenHash: hash(token),
      expiraEm: new Date(Date.now() + VALIDADE_MS),
    });

    const link = `${baseUrl()}/redefinir-senha?token=${encodeURIComponent(token)}`;
    try {
      await EmailService.enviar({
        to: usuario.email,
        subject: "Redefinir sua senha — G-Simulados",
        html: templateResetSenha(usuario.name, link),
      });
    } catch (erro) {
      // E-mail fora do ar não pode virar 500 para quem pediu o reset.
      console.error("[password-reset] falha ao enviar e-mail:", (erro as Error).message);
    }
  }

  /** Consome o token (uma vez), troca a senha e derruba as sessões antigas. */
  static async redefinir(token: string, novaSenha: string): Promise<void> {
    const registro = await PasswordReset.findOne({
      tokenHash: hash(token),
      usadoEm: { $exists: false },
      expiraEm: { $gt: new Date() },
    });
    if (!registro) {
      throw Object.assign(new Error("Link inválido ou expirado. Peça um novo."), {
        statusCode: 400,
      });
    }

    const usuario = await User.findById(registro.usuario);
    if (!usuario) {
      throw Object.assign(new Error("Usuário não encontrado"), {
        statusCode: 404,
      });
    }

    usuario.password = await bcrypt.hash(novaSenha, 10);
    await usuario.save();

    registro.usadoEm = new Date();
    await registro.save();

    // Quem trocou a senha não continua logado em outro dispositivo.
    await RefreshTokenService.revogarTodos(String(usuario._id));
  }
}
