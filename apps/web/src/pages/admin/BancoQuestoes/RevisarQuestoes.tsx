import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import {
  QuestionReviewService,
  type IQuestionReview,
} from "src/services/question-review.service";

export function RevisarQuestoes() {
  const [questoes, setQuestoes] = useState<IQuestionReview[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const questao = questoes[currentIndex];

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
  return (
    <Box>
      <Typography variant="h4">Revisar Questões</Typography>
      <Typography>Pendentes: {questoes.length}</Typography>
      {questao && (
        <Card>
          <CardContent>
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
            {questao.alternativas.map((alt, index) => (
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
                sx={{ mb: 1 }}
              />
            ))}

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
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
            <Button color="success" onClick={handleApprove}>
              Aprovar
            </Button>
          </CardActions>
        </Card>
      )}
    </Box>
  );
}
