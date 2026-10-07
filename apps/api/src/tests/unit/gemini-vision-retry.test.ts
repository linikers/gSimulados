import { extractQuestionsFromPdf } from "../../services/gemini-vision.service";
import * as geminiClient from "../../services/gemini/gemini-client.service";

jest.mock("../../services/gemini/gemini-client.service");

const mockGerar = geminiClient.gerarConteudoGemini as jest.MockedFunction<
  typeof geminiClient.gerarConteudoGemini
>;

/** Monta uma resposta do modelo com N questões. */
const respostaCom = (n: number) =>
  JSON.stringify({
    questoes: Array.from({ length: n }, (_, i) => ({
      numeroQuestao: i + 1,
      enunciado: `Questão ${i + 1}`,
      alternativas: ["A) a", "B) b"],
      tipoQuestao: "multipla_escolha",
      temGabarito: false,
      temImagem: false,
      pageNumber: 1,
    })),
  });

describe("extractQuestionsFromPdf — robustez contra resposta pobre", () => {
  beforeEach(() => jest.clearAllMocks());

  it("repete a extração quando o modelo devolve poucas questões e fica com a melhor", async () => {
    // O modelo já devolveu 46 questões e, na chamada seguinte do MESMO pdf,
    // 1 questão com finishReason=STOP. A segunda tentativa tem que salvar.
    mockGerar
      .mockResolvedValueOnce(respostaCom(1))
      .mockResolvedValueOnce(respostaCom(40));

    const r = await extractQuestionsFromPdf(Buffer.from("pdf"), "UEM");

    expect(r.questoes).toHaveLength(40);
    expect(mockGerar).toHaveBeenCalledTimes(2);
  });

  it("não repete quando o primeiro resultado já é confiável", async () => {
    mockGerar.mockResolvedValueOnce(respostaCom(20));

    const r = await extractQuestionsFromPdf(Buffer.from("pdf"), "UEM");

    expect(r.questoes).toHaveLength(20);
    expect(mockGerar).toHaveBeenCalledTimes(1);
  });

  it("lança erro quando todas as tentativas voltam vazias", async () => {
    mockGerar.mockResolvedValue(respostaCom(0));

    await expect(
      extractQuestionsFromPdf(Buffer.from("pdf"), "UEM"),
    ).rejects.toThrow();
  });

  it("tolera uma tentativa que falha e aproveita a seguinte", async () => {
    mockGerar
      .mockRejectedValueOnce(new Error("503 modelo sobrecarregado"))
      .mockResolvedValueOnce(respostaCom(12));

    const r = await extractQuestionsFromPdf(Buffer.from("pdf"), "UEM");

    expect(r.questoes).toHaveLength(12);
  });
});
