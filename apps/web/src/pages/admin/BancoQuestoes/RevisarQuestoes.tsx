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
                // setQuestao({ ...questao, enunciado: e.target.value })
                setQuestoes((prev) => {
                  const copy = [...prev];
                  copy[currentIndex] = {
                    ...copy[currentIndex],
                    enunciado: e.target.value,
                  };
                  return copy;
                })
              }
            />
            {/* Alternativas editáveis */}
            {/* Dropdown de resposta correta */}
            {/* Campos de matéria e assunto */}
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
