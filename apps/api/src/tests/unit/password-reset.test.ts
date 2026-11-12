/**
 * Reset de senha: pedido não revela existência, token é hash e uso único,
 * e trocar a senha derruba as sessões (refresh) antigas.
 */
const userFindOneMock = jest.fn();
const userFindByIdMock = jest.fn();
const resetFindOneMock = jest.fn();
const resetCreateMock = jest.fn();
const resetUpdateManyMock = jest.fn();
const emailMock = jest.fn();
const revogarTodosMock = jest.fn();

jest.mock("../../models/User", () => ({
  User: {
    findOne: (...a: unknown[]) => userFindOneMock(...a),
    findById: (...a: unknown[]) => userFindByIdMock(...a),
  },
}));

jest.mock("../../models/PasswordReset", () => ({
  PasswordReset: {
    findOne: (...a: unknown[]) => resetFindOneMock(...a),
    create: (...a: unknown[]) => resetCreateMock(...a),
    updateMany: (...a: unknown[]) => resetUpdateManyMock(...a),
  },
}));

jest.mock("../../services/email/email.service", () => ({
  EmailService: { enviar: (...a: unknown[]) => emailMock(...a) },
}));

jest.mock("../../services/auth/refresh-token.service", () => ({
  RefreshTokenService: {
    revogarTodos: (...a: unknown[]) => revogarTodosMock(...a),
  },
}));

import bcrypt from "bcryptjs";
import { PasswordResetService } from "../../services/auth/password-reset.service";

beforeEach(() => {
  jest.clearAllMocks();
  resetCreateMock.mockResolvedValue({});
  resetUpdateManyMock.mockResolvedValue({});
  emailMock.mockResolvedValue({ enviado: false, provider: "log" });
  revogarTodosMock.mockResolvedValue(undefined);
});

describe("PasswordResetService.solicitar", () => {
  it("cria token hasheado e manda o link para quem existe", async () => {
    userFindOneMock.mockResolvedValue({
      _id: "u1",
      name: "Aluno Teste",
      email: "aluno@exemplo.com",
    });

    await PasswordResetService.solicitar("  Aluno@Exemplo.com ");

    expect(resetCreateMock).toHaveBeenCalledTimes(1);
    const salvo = resetCreateMock.mock.calls[0][0];
    expect(salvo.tokenHash).toHaveLength(64);
    expect(JSON.stringify(salvo)).not.toContain("redefinir-senha?token=");

    expect(emailMock).toHaveBeenCalledTimes(1);
    const email = emailMock.mock.calls[0][0];
    expect(email.to).toBe("aluno@exemplo.com");
    expect(email.html).toContain("/redefinir-senha?token=");
  });

  it("não cria nada nem envia e-mail para desconhecido", async () => {
    userFindOneMock.mockResolvedValue(null);

    await expect(
      PasswordResetService.solicitar("ninguem@exemplo.com"),
    ).resolves.toBeUndefined();

    expect(resetCreateMock).not.toHaveBeenCalled();
    expect(emailMock).not.toHaveBeenCalled();
  });

  it("e-mail fora do ar não propaga erro (pedido segue 202)", async () => {
    userFindOneMock.mockResolvedValue({
      _id: "u1",
      name: "Aluno",
      email: "aluno@exemplo.com",
    });
    emailMock.mockRejectedValue(new Error("Resend 500"));
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(
      PasswordResetService.solicitar("aluno@exemplo.com"),
    ).resolves.toBeUndefined();
  });
});

describe("PasswordResetService.redefinir", () => {
  it("recusa link expirado/usado (não encontrado)", async () => {
    resetFindOneMock.mockResolvedValue(null);

    await expect(
      PasswordResetService.redefinir("token-invalido", "novaSenha123"),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("troca a senha, queima o token e revoga os refresh", async () => {
    const registro = { usuario: "u1", usadoEm: undefined, save: jest.fn() };
    const usuario = { _id: "u1", password: "hash-antigo", save: jest.fn() };
    resetFindOneMock.mockResolvedValue(registro);
    userFindByIdMock.mockResolvedValue(usuario);

    await PasswordResetService.redefinir("token-valido", "novaSenha123");

    expect(await bcrypt.compare("novaSenha123", usuario.password)).toBe(true);
    expect(usuario.save).toHaveBeenCalled();
    expect(registro.usadoEm).toBeInstanceOf(Date);
    expect(registro.save).toHaveBeenCalled();
    expect(revogarTodosMock).toHaveBeenCalledWith("u1");
  });
});
