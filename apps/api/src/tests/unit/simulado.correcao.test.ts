import { isRespostaCorreta } from "../../services/simulado.service";

describe("Correção de simulado - isRespostaCorreta", () => {
  it("aceita a letra correta em múltipla escolha", () => {
    expect(isRespostaCorreta("A", "A")).toBe(true);
    expect(isRespostaCorreta("C", "C")).toBe(true);
  });

  it("rejeita letra errada", () => {
    expect(isRespostaCorreta("A", "B")).toBe(false);
    expect(isRespostaCorreta("E", "D")).toBe(false);
  });

  it("é case-insensitive e tolera espaços", () => {
    expect(isRespostaCorreta(" a ", "A")).toBe(true);
    expect(isRespostaCorreta("b", " B ")).toBe(true);
  });

  it("considera resposta em branco como incorreta", () => {
    expect(isRespostaCorreta("A", "")).toBe(false);
    expect(isRespostaCorreta("A", undefined as unknown as string)).toBe(false);
  });

  it("compara somatória/numérico por igualdade direta", () => {
    expect(isRespostaCorreta("15", "15")).toBe(true);
    expect(isRespostaCorreta("15", "14")).toBe(false);
  });
});
