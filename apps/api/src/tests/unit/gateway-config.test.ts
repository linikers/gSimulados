/**
 * Credenciais de gateway: cifra em repouso, máscara na resposta e fallback
 * painel → ambiente.
 */
const findOneAndUpdateMock = jest.fn();
const deleteOneMock = jest.fn();
const findMock = jest.fn();

jest.mock("../../models/GatewayConfig", () => ({
  GatewayConfig: {
    findOneAndUpdate: (...a: unknown[]) => findOneAndUpdateMock(...a),
    deleteOne: (...a: unknown[]) => deleteOneMock(...a),
    find: (...a: unknown[]) => findMock(...a),
  },
}));

import { cifrar, decifrar, mascarar } from "../../services/gateway-config/crypto";
import { GatewayConfigService } from "../../services/gateway-config/gateway-config.service";

describe("crypto de credenciais", () => {
  it("cifra e decifra o mesmo objeto", () => {
    const credenciais = { accessToken: "APP_USR-1234567890", publicKey: "pk" };
    const cifrado = cifrar(credenciais);

    expect(cifrado).not.toContain("APP_USR");
    expect(decifrar(cifrado)).toEqual(credenciais);
  });

  it("mascara deixando só os 4 últimos", () => {
    expect(mascarar("APP_USR-1234567890")).toBe("••••7890");
    expect(mascarar("")).toBe("");
  });
});

describe("GatewayConfigService", () => {
  const envOriginal = process.env.MP_ACCESS_TOKEN;

  afterEach(() => {
    process.env.MP_ACCESS_TOKEN = envOriginal;
    jest.clearAllMocks();
  });

  it("usa o token do ambiente quando não há nada no painel", () => {
    process.env.MP_ACCESS_TOKEN = "TEST-ENV-TOKEN";
    expect(GatewayConfigService.token("mercadopago")).toBe("TEST-ENV-TOKEN");
  });

  it("salvar atualiza o cache e passa a valer na hora", async () => {
    process.env.MP_ACCESS_TOKEN = "TEST-ENV-TOKEN";
    findOneAndUpdateMock.mockResolvedValue({});

    await GatewayConfigService.salvar("mercadopago", {
      accessToken: "APP_USR-PAINEL-9999",
    });

    expect(findOneAndUpdateMock).toHaveBeenCalled();
    expect(GatewayConfigService.token("mercadopago")).toBe(
      "APP_USR-PAINEL-9999",
    );

    await GatewayConfigService.remover("mercadopago");
    expect(deleteOneMock).toHaveBeenCalledWith({ gateway: "mercadopago" });
    expect(GatewayConfigService.token("mercadopago")).toBe("TEST-ENV-TOKEN");
  });
});
