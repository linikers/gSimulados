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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  LinearProgress,
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

  // Estados para Auditoria IA
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

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
    setAuditLoading(true);
    setAuditDialogOpen(true);
    setAuditResult(null);

    try {
      const result = await QuestionReviewService.audit(questao._id);
      setAuditResult(result.auditResult);

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
      }
    } catch (error: any) {
      console.error("Erro na auditoria:", error);
      setAuditResult({
        status: "flagged",
        feedback: `Erro ao realizar auditoria: ${error.message || "Erro desconhecido"}.`,
      });
    } finally {
      setAuditLoading(false);
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

      {/* Dialog de Resultado da Auditoria */}
      <Dialog
        open={auditDialogOpen}
        onClose={() => !auditLoading && setAuditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
          Auditoria Acadêmica IA 🤖
        </DialogTitle>
        <DialogContent dividers>
          {auditLoading ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography color="text.secondary">
                O Professor Revisor Auditing está analisando a questão...
              </Typography>
            </Box>
          ) : auditResult ? (
            <Box>
              {auditResult.status === "corrected" && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  A IA sugeriu uma correção no gabarito para: <strong>{auditResult.gabaritoCorreto}</strong>
                </Alert>
              )}
              {auditResult.status === "approved" && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  A questão foi validada com sucesso! Gabarito {auditResult.gabaritoCorreto} parece correto.
                </Alert>
              )}
              {auditResult.status === "flagged" && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Problema Identificado na Auditoria.
                </Alert>
              )}

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Análise do {auditResult.academicRole || "Professor Revisor"}:
              </Typography>
              <Typography variant="body1" sx={{ fontStyle: "italic", mb: 3 }}>
                "{auditResult.feedback}"
              </Typography>

              {auditResult.confidence !== undefined && (
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">Confiança da IA</Typography>
                    <Typography variant="caption" color="text.secondary">{auditResult.confidence}%</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={auditResult.confidence}
                    color={auditResult.confidence > 80 ? "success" : auditResult.confidence > 50 ? "warning" : "error"}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              )}
            </Box>
          ) : (
            <Typography>Nenhum resultado recebido.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setAuditDialogOpen(false)}
            disabled={auditLoading}
            fullWidth
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
