/**
 * Validação das rotas de auth: erro em português, sem chegar no controller.
 */
import { loginSchema, registerSchema, refreshSchema } from "../../schemas/auth.schema";

describe("schemas de auth", () => {
  it("login rejeita e-mail inválido e senha curta", () => {
    const resultado = loginSchema.safeParse({
      email: "nao-e-email",
      password: "123",
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const campos = resultado.error.issues.map((i) => i.path.join("."));
      expect(campos).toContain("email");
      expect(campos).toContain("password");
    }
  });

  it("login normaliza e-mail (trim + lowercase) e aceita senha válida", () => {
    const resultado = loginSchema.safeParse({
      email: "  Aluno@Exemplo.com ",
      password: "segredo123",
    });

    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.email).toBe("aluno@exemplo.com");
    }
  });

  it("cadastro público não aceita role admin", () => {
    const resultado = registerSchema.safeParse({
      name: "Fulano",
      email: "fulano@exemplo.com",
      password: "segredo123",
      role: "admin",
    });

    expect(resultado.success).toBe(false);
  });

  it("cadastro sem role assume aluno", () => {
    const resultado = registerSchema.safeParse({
      name: "Fulano",
      email: "fulano@exemplo.com",
      password: "segredo123",
    });

    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.role).toBe("aluno");
    }
  });

  it("refresh exige token com tamanho plausível", () => {
    expect(refreshSchema.safeParse({ refreshToken: "curto" }).success).toBe(false);
    expect(
      refreshSchema.safeParse({ refreshToken: "a".repeat(64) }).success,
    ).toBe(true);
  });
});
