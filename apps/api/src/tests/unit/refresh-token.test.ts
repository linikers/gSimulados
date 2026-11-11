/**
 * Refresh token: rotação revoga o antigo, token expirado/revogado não renova.
 */
const findOneMock = jest.fn();
const createMock = jest.fn();
const updateOneMock = jest.fn();

jest.mock("../../models/RefreshToken", () => ({
  RefreshToken: {
    findOne: (...a: unknown[]) => findOneMock(...a),
    create: (...a: unknown[]) => createMock(...a),
    updateOne: (...a: unknown[]) => updateOneMock(...a),
    updateMany: jest.fn(),
  },
}));

import { RefreshTokenService } from "../../services/auth/refresh-token.service";

beforeEach(() => {
  jest.clearAllMocks();
  createMock.mockResolvedValue({});
});

describe("RefreshTokenService", () => {
  it("cria um token cru e guarda só o hash", async () => {
    const token = await RefreshTokenService.criar("u1", "jest");

    expect(token).toHaveLength(64);
    const salvo = createMock.mock.calls[0][0];
    expect(salvo.tokenHash).not.toBe(token);
    expect(salvo.tokenHash).toHaveLength(64);
    expect(salvo.usuario).toBe("u1");
  });

  it("rotaciona: revoga o atual e devolve um novo", async () => {
    const atual = {
      usuario: "u1",
      revogadoEm: undefined,
      save: jest.fn().mockResolvedValue(undefined),
    };
    findOneMock.mockResolvedValue(atual);

    const resultado = await RefreshTokenService.rotacionar("token-antigo", "jest");

    expect(atual.revogadoEm).toBeInstanceOf(Date);
    expect(atual.save).toHaveBeenCalled();
    expect(resultado.usuarioId).toBe("u1");
    expect(resultado.refreshToken).not.toBe("token-antigo");
    // o novo token também foi persistido
    expect(createMock).toHaveBeenCalled();
  });

  it("recusa token que não existe, expirou ou foi revogado", async () => {
    findOneMock.mockResolvedValue(null);

    await expect(
      RefreshTokenService.rotacionar("invalido"),
    ).rejects.toThrow("Refresh token inválido ou expirado");
  });

  it("logout revoga o token apresentado", async () => {
    updateOneMock.mockResolvedValue({});

    await RefreshTokenService.revogar("token");

    const filtro = updateOneMock.mock.calls[0][0];
    expect(filtro.revogadoEm).toEqual({ $exists: false });
    expect(updateOneMock.mock.calls[0][1].$set.revogadoEm).toBeInstanceOf(Date);
  });
});
