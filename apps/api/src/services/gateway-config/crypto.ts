import crypto from "crypto";

/**
 * Cifra pequena para credenciais de gateway (AES-256-GCM).
 *
 * A chave vem de `CONFIG_ENCRYPTION_KEY`; se ela não existir, cai para
 * `JWT_SECRET` (já presente em produção) para não gravar token em claro.
 * Formato: `iv.tag.dados`, tudo base64.
 */
function chave(): Buffer {
  const segredo =
    process.env.CONFIG_ENCRYPTION_KEY?.trim() ||
    process.env.JWT_SECRET?.trim() ||
    "gsimulados-dev-config-key";
  return crypto.createHash("sha256").update(segredo).digest();
}

export function cifrar(objeto: unknown): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", chave(), iv);
  const dados = Buffer.concat([
    cipher.update(JSON.stringify(objeto), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [iv, tag, dados].map((b) => b.toString("base64")).join(".");
}

export function decifrar<T>(payload: string): T {
  const [ivB64, tagB64, dadosB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dadosB64) {
    throw new Error("Credencial cifrada em formato inválido");
  }
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    chave(),
    Buffer.from(ivB64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const dados = Buffer.concat([
    decipher.update(Buffer.from(dadosB64, "base64")),
    decipher.final(),
  ]);
  return JSON.parse(dados.toString("utf8")) as T;
}

/** `••••abcd` — o suficiente para o admin reconhecer a credencial. */
export function mascarar(valor?: string): string {
  const limpo = (valor ?? "").trim();
  if (!limpo) return "";
  if (limpo.length <= 4) return "••••";
  return `••••${limpo.slice(-4)}`;
}
