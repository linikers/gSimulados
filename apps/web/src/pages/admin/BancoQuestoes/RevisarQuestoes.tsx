import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  TextField,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";
import {
  QuestionReviewService,
  type IQuestionReview,
} from "src/services/question-review.service";

export function RevisarQuestoes() {
  const [questoes, setQuestoes] = useState<IQuestionReview[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const questao = questoes[currentIndex];

  const loadQuestoes = async () => {
    try {
      const data = await QuestionReviewService.listPending();
      setQuestoes(data);
    } catch (error) {
      console.error("Erro ao carregar questões:", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadQuestoes();
  }, []);

  const loadNext = () => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= questoes.length) {
        // acabou as questões
        return prev; // ou 0, ou mostrar mensagem
      }
      return next;
    });
  };
  const handleApprove = async () => {
    if (!questao) return;
    await QuestionReviewService.approve(questao._id, questao);
    loadNext();
  };
  const handleReject = async () => {
    if (!questao) return;
    await QuestionReviewService.reject(questao._id);
    loadNext();
  };

  const handleAudit = async () => {
    if (!questao) return;
    try {
      const result = await QuestionReviewService.audit(questao._id);
      // Atualiza a questão atual com os dados auditados (ex: gabarito corrigido)
      if (result.auditResult?.gabaritoCorreto) {
        setQuestoes((prev) => {
          const copy = [...prev];
          copy[currentIndex] = {
            ...copy[currentIndex],
            respostaCorreta: result.auditResult.gabaritoCorreto,
          };
          return copy;
        });
        alert(`Auditoria Concluída!\nFeedback: ${result.auditResult.feedback}`);
      } else {
        alert(`Auditoria Concluída! Nenhuma alteração sugerida.\nFeedback: ${result.auditResult?.feedback}`);
      }
    } catch (error) {
      console.error("Erro na auditoria:", error);
      alert("Erro ao realizar auditoria.");
    }
  };

  return (
    <Box>
      <Typography variant="h4">Revisar Questões</Typography>
      <Typography sx={{ mb: 2 }}>Pendentes: {questoes.length}</Typography>
      {questao && (
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {questao.temGabarito ? (
                <Chip
                  label="Possui Gabarito"
                  color="success"
                  variant="filled"
                />
              ) : (
                <Chip label="Sem Gabarito" color="warning" variant="outlined" />
              )}
              <Chip
                label={
                  questao.tipoQuestao === "somatoria"
                    ? "Somatória"
                    : questao.tipoQuestao === "alternativa"
                      ? "Alternativas"
                      : "Múltipla Escolha"
                }
                color="info"
                variant="outlined"
              />
            </Stack>
            {/* Exibir imagem se existir */}
            {questao.imagemUrl && (
              <Box sx={{ mb: 2 }}>
                <img
                  src={questao.imagemUrl}
                  alt="Questão"
                  style={{ maxWidth: "100%" }}
                />
              </Box>
            )}
            <TextField
              label="Enunciado"
              multiline
              rows={4}
              value={questao.enunciado}
              onChange={(e) =>
                setQuestoes((prev) => {
                  const copy = [...prev];
                  copy[currentIndex] = {
                    ...copy[currentIndex],
                    enunciado: e.target.value,
                  };
                  return copy;
                })
              }
              fullWidth
              sx={{ mb: 2 }}
            />

            <Typography variant="h6" sx={{ mt: 2 }}>
              Alternativas
            </Typography>
            {questao.alternativas.map((alt, index) => {
              // Determinar se esta alternativa está correta
              const isCorrect = (() => {
                if (!questao.respostaCorreta) return false;

                if (questao.tipoQuestao === "somatoria") {
                  // Para somatória, extrair números das alternativas (ex: "01) Texto" -> 1)
                  const altNumber = parseInt(alt.match(/^(\d+)/)?.[1] || "0");
                  const correctSum = parseInt(questao.respostaCorreta);
                  // Verificar se este número está na soma (bit a bit)
                  return (correctSum & altNumber) === altNumber;
                } else {
                  // Para múltipla escolha, comparar letra
                  const letter = String.fromCharCode(65 + index); // A, B, C...
                  return questao.respostaCorreta.toUpperCase() === letter;
                }
              })();

              return (
                <TextField
                  key={index}
                  label={`Alternativa ${String.fromCharCode(65 + index)}`}
                  value={alt}
                  onChange={(e) =>
                    setQuestoes((prev) => {
                      const copy = [...prev];
                      const newAlts = [...copy[currentIndex].alternativas];
                      newAlts[index] = e.target.value;
                      copy[currentIndex] = {
                        ...copy[currentIndex],
                        alternativas: newAlts,
                      };
                      return copy;
                    })
                  }
                  fullWidth
                  sx={{
                    mb: 1,
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: isCorrect
                        ? "rgba(76, 175, 80, 0.1)"
                        : "transparent",
                      "&:hover": {
                        backgroundColor: isCorrect
                          ? "rgba(76, 175, 80, 0.15)"
                          : "transparent",
                      },
                    },
                  }}
                />
              );
            })}

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              {questao.tipoQuestao === "somatoria" ? (
                <TextField
                  label="Resposta Correta (Soma)"
                  value={questao.respostaCorreta || ""}
                  onChange={(e) =>
                    setQuestoes((prev) => {
                      const copy = [...prev];
                      copy[currentIndex] = {
                        ...copy[currentIndex],
                        respostaCorreta: e.target.value,
                      };
                      return copy;
                    })
                  }
                  placeholder="Ex: 09, 15, 31"
                  sx={{ width: 200 }}
                />
              ) : (
                <TextField
                  select
                  label="Resposta Correta"
                  value={questao.respostaCorreta}
                  onChange={(e) =>
                    setQuestoes((prev) => {
                      const copy = [...prev];
                      copy[currentIndex] = {
                        ...copy[currentIndex],
                        respostaCorreta: e.target.value,
                      };
                      return copy;
                    })
                  }
                  SelectProps={{
                    native: true,
                  }}
                  sx={{ width: 150 }}
                >
                  {["A", "B", "C", "D", "E"].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </TextField>
              )}

              <TextField
                label="Matéria"
                value={questao.materia || ""}
                onChange={(e) =>
                  setQuestoes((prev) => {
                    const copy = [...prev];
                    copy[currentIndex] = {
                      ...copy[currentIndex],
                      materia: e.target.value,
                    };
                    return copy;
                  })
                }
                sx={{ flex: 1 }}
              />

              <TextField
                label="Assunto"
                value={questao.assunto || ""}
                onChange={(e) =>
                  setQuestoes((prev) => {
                    const copy = [...prev];
                    copy[currentIndex] = {
                      ...copy[currentIndex],
                      assunto: e.target.value,
                    };
                    return copy;
                  })
                }
                sx={{ flex: 1 }}
              />
            </Box>
          </CardContent>
          <CardActions>
            <Button color="error" onClick={handleReject}>
              Rejeitar
            </Button>
            <Button color="info" onClick={handleAudit} variant="outlined">
              Auditar com IA 🤖
            </Button>
            <Button color="success" onClick={handleApprove}>
              Aprovar
            </Button>
          </CardActions>
        </Card>
      )}
    </Box>
  );
}
