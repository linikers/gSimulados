import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  LinearProgress,
  IconButton,
  Paper,
  //   Grid,
  CircularProgress,
  AppBar,
  Toolbar,
  Chip,
} from "@mui/material";
import { SimuladoService } from "../../../services/simulado.service";
import type { ISimulado, IQuestion } from "../../../types/simulado";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import {
  ArrowBack,
  CheckCircle,
  Flag,
  HelpOutline,
  AutoAwesome,
} from "@mui/icons-material";

export default function VisualizarSimulado() {
  const { id } = useParams<{ id: string }>();
  const [simulado, setSimulado] = useState<ISimulado | null>(null);
  const [loading, setLoading] = useState(true);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [scrolled, setScrolled] = useState(0);
  const { handleError } = useErrorHandler();

  const loadSimulado = useCallback(
    async (simuladoId: string) => {
      try {
        const data = await SimuladoService.getById(simuladoId);
        setSimulado(data);
      } catch (error) {
        handleError(error, "Erro ao carregar simulado.");
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  useEffect(() => {
    if (id) loadSimulado(id);
  }, [id, loadSimulado]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setScrolled((totalScroll / windowHeight) * 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const selectAnswer = (questionId: string, index: number) => {
    setRespostas((prev) => ({ ...prev, [questionId]: index }));
  };

  if (loading)
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "var(--bg-color)",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );

  if (!simulado)
    return (
      <Container
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          bgcolor: "var(--bg-color)",
        }}
      >
        <Box
          sx={{ p: 4, borderRadius: "24px", bgcolor: "var(--input-bg)", mb: 4 }}
        >
          <HelpOutline sx={{ fontSize: 60, color: "text.disabled" }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
          Simulado não encontrado
        </Typography>
        <Button
          component={Link}
          to="/aluno/simulados"
          variant="outlined"
          startIcon={<ArrowBack />}
          sx={{ borderRadius: "12px" }}
        >
          Voltar para a Dashboard
        </Button>
      </Container>
    );

  return (
    <Box sx={{ bgcolor: "var(--bg-color)", minHeight: "100vh", pb: 10 }}>
      {/* Scroll Progress Bar */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1201,
          height: 6,
        }}
      >
        <LinearProgress
          variant="determinate"
          value={scrolled}
          sx={{ height: 6 }}
        />
      </Box>

      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "var(--border-color)",
          bgcolor: "var(--bg-color)",
          backdropFilter: "blur(12px)",
          transition: "all 0.3s ease",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                component={Link}
                to="/aluno/simulados"
                sx={{ bgcolor: "var(--input-bg)" }}
              >
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}
                >
                  {simulado.nome}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Chip
                    label={simulado.materia || "Misto"}
                    size="small"
                    sx={{ fontWeight: 800, borderRadius: "6px" }}
                  />
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{ fontWeight: 800 }}
                  >
                    {Object.keys(respostas).length} /{" "}
                    {simulado.quantidadeQuestoes} respondidas
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Flag />}
                sx={{
                  borderRadius: "10px",
                  display: { xs: "none", md: "flex" },
                }}
              >
                Revisar
              </Button>
              <Button
                variant="contained"
                color="success"
                sx={{ borderRadius: "10px", px: 4, fontWeight: "bold" }}
              >
                Finalizar
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* Intro Card */}
        <Paper
          elevation={0}
          className="glass-container"
          sx={{ mb: 6, position: "relative", overflow: "hidden" }}
        >
          <Box sx={{ position: "relative", zIndex: 1, maxWidth: "80%" }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Instruções da IA
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Este simulado foi balanceado com base na dificuldade selecionada.
              Leia cada questão atentamente. Ao terminar, clique em finalizar
              para processar seu desempenho.
            </Typography>
          </Box>
          <AutoAwesome
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              fontSize: 100,
              opacity: 0.05,
            }}
          />
        </Paper>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(simulado.questoes as IQuestion[]).map((questao, index) => {
            const respondida = respostas[questao._id] !== undefined;
            return (
              <Paper
                key={questao._id}
                elevation={0}
                className="glass-container"
                sx={{
                  p: { xs: 3, md: 5 },
                  borderColor: respondida
                    ? "success.main"
                    : "var(--border-color)",
                  borderWidth: respondida ? 2 : 1,
                  transition: "all 0.3s ease",
                }}
              >
                <Box sx={{ display: "flex", gap: { xs: 2, md: 4 }, mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: respondida
                          ? "success.main"
                          : "var(--input-bg)",
                        color: respondida ? "white" : "text.disabled",
                        fontWeight: 800,
                        fontSize: "1.25rem",
                        boxShadow: respondida
                          ? "0 8px 16px rgba(46, 125, 50, 0.2)"
                          : "none",
                      }}
                    >
                      {index + 1}
                    </Box>
                    {respondida && (
                      <CheckCircle color="success" sx={{ fontSize: 18 }} />
                    )}
                  </Box>

                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, lineHeight: 1.5 }}
                  >
                    {questao.enunciado}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    ml: { xs: 0, md: 10 },
                  }}
                >
                  {questao.alternativas.map((alternativa, altIndex) => {
                    const isSelected = respostas[questao._id] === altIndex;
                    return (
                      <Button
                        key={altIndex}
                        onClick={() => selectAnswer(questao._id, altIndex)}
                        variant={isSelected ? "contained" : "outlined"}
                        color={isSelected ? "primary" : "inherit"}
                        sx={{
                          justifyContent: "flex-start",
                          textAlign: "left",
                          p: 2.5,
                          borderRadius: "16px",
                          border: "1px solid",
                          borderColor: isSelected
                            ? "primary.main"
                            : "var(--border-color)",
                          bgcolor: isSelected
                            ? "primary.main"
                            : "var(--input-bg)",
                          textTransform: "none",
                          fontSize: "1.1rem",
                          fontWeight: 500,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: isSelected
                              ? "primary.dark"
                              : "rgba(0,0,0,0.04)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            minWidth: 32,
                            height: 32,
                            borderRadius: "8px",
                            bgcolor: isSelected
                              ? "white"
                              : "var(--border-color)",
                            color: isSelected
                              ? "primary.main"
                              : "text.secondary",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 900,
                            mr: 2,
                          }}
                        >
                          {String.fromCharCode(65 + altIndex)}
                        </Box>
                        {alternativa}
                      </Button>
                    );
                  })}
                </Box>
              </Paper>
            );
          })}
        </Box>

        {/* Action Bar */}
        <Box sx={{ mt: 10, mb: 10, textAlign: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Fim das Questões
          </Typography>
          <Typography variant="body2" sx={{ mb: 4, color: "text.secondary" }}>
            Revise suas respostas antes de enviar para correção definitiva.
          </Typography>
          <Button
            variant="contained"
            color="success"
            size="large"
            sx={{
              py: 2,
              px: 8,
              borderRadius: "16px",
              fontSize: "1.2rem",
              fontWeight: 900,
              boxShadow: "0 8px 32px rgba(46, 125, 50, 0.3)",
            }}
          >
            Finalizar Simulado ✨
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
