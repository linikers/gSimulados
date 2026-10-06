import {
  extrairStatusErro,
  GEMINI_MODELOS,
} from "../../services/gemini/gemini-client.service";

describe("Gemini - extrairStatusErro", () => {
  it("extrai o status das mensagens de erro do SDK", () => {
    expect(
      extrairStatusErro(
        new Error(
          "[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/... [503 Service Unavailable]",
        ),
      ),
    ).toBe(503);
    expect(
      extrairStatusErro(new Error("[429 Too Many Requests] quota exceeded")),
    ).toBe(429);
    expect(
      extrairStatusErro(
        new Error("[404 Not Found] model is no longer available"),
      ),
    ).toBe(404);
  });

  it("usa o campo status quando a mensagem não traz o código", () => {
    expect(extrairStatusErro({ status: 503 })).toBe(503);
  });

  it("retorna undefined quando não há como saber", () => {
    expect(extrairStatusErro(new Error("erro sem status"))).toBeUndefined();
    expect(extrairStatusErro(undefined)).toBeUndefined();
  });
});

describe("Gemini - cadeia de fallback", () => {
  it("tem mais de um modelo configurado (não depende de um nome só)", () => {
    expect(GEMINI_MODELOS.length).toBeGreaterThan(1);
    expect(GEMINI_MODELOS).toContain("gemini-flash-latest");
  });
});
