import crypto from "crypto";
import { RefreshToken } from "../../models/RefreshToken";

/** Dias de validade do refresh token (sessão longa). */
const DIAS = Number(process.env.REFRESH_TOKEN_DIAS || 30);

function hash(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export class RefreshTokenService {
  /** Cria um token novo e devolve o valor cru (só ele vai para o cliente). */
  static async criar(usuarioId: string, userAgent?: string): Promise<string> {
    const token = crypto.randomBytes(48).toString("base64url");
    const expiraEm = new Date(Date.now() + DIAS * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      usuario: usuarioId,
      tokenHash: hash(token),
      expiraEm,
      ...(userAgent ? { userAgent: userAgent.slice(0, 200) } : {}),
    });
    return token;
  }

  /**
   * Troca um refresh válido por outro (rotação): o antigo é revogado na hora.
   * Retorna o usuário dono para o caller emitir um novo access token.
   */
  static async rotacionar(
    token: string,
    userAgent?: string,
  ): Promise<{ usuarioId: string; refreshToken: string }> {
    const atual = await RefreshToken.findOne({
      tokenHash: hash(token),
      revogadoEm: { $exists: false },
      expiraEm: { $gt: new Date() },
    });
    if (!atual) {
      throw new Error("Refresh token inválido ou expirado");
    }

    atual.revogadoEm = new Date();
    await atual.save();

    const novo = await this.criar(String(atual.usuario), userAgent);
    return { usuarioId: String(atual.usuario), refreshToken: novo };
  }

  /** Logout: revoga o token apresentado (idempotente). */
  static async revogar(token: string): Promise<void> {
    await RefreshToken.updateOne(
      { tokenHash: hash(token), revogadoEm: { $exists: false } },
      { $set: { revogadoEm: new Date() } },
    );
  }

  /** Útil para "sair de todos os dispositivos" e em resposta a vazamento. */
  static async revogarTodos(usuarioId: string): Promise<void> {
    await RefreshToken.updateMany(
      { usuario: usuarioId, revogadoEm: { $exists: false } },
      { $set: { revogadoEm: new Date() } },
    );
  }
}
