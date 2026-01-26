import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  //   IconButton,
  Chip,
} from "@mui/material";
import type { ChipProps } from "@mui/material";
import { SimuladoService } from "../../../services/simulado.service";
import { Link } from "react-router-dom";
import type { ISimulado } from "../../../types/simulado";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import {
  AutoAwesome,
  Add,
  ArrowForward,
  History,
  School,
  Timer,
  BarChart,
} from "@mui/icons-material";

export default function MeusSimulados() {
  const [simulados, setSimulados] = useState<ISimulado[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  const loadSimulados = useCallback(async () => {
    try {
      const data = await SimuladoService.listMySimulados();
      setSimulados(data);
    } catch (error) {
      handleError(error, "Erro ao carregar seus simulados.");
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    loadSimulados();
  }, [loadSimulados]);

  const getSubjectMeta = (subject: string) => {
    const s = (subject || "").toLowerCase();
    if (s.includes("mat")) return { color: "primary", icon: <BarChart /> };
    if (s.includes("fis")) return { color: "secondary", icon: <AutoAwesome /> };
    if (s.includes("qui")) return { color: "success", icon: <AutoAwesome /> };
    if (s.includes("bio")) return { color: "error", icon: <School /> };
    return { color: "info", icon: <School /> };
  };

  const getDifficultyColor = (diff: string): ChipProps["color"] => {
    const d = (diff || "").toLowerCase();
    if (d === "facil") return "success";
    if (d === "medio") return "warning";
    if (d === "dificil") return "error";
    return "default";
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 4,
          mb: 8,
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "primary.main",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 2,
              mb: 1,
            }}
          >
            <History fontSize="small" />
            <span>Sua Jornada</span>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
            Meus Simulados
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: "1.2rem" }}
          >
            Gerencie e revise todos os seus exames personalizados por IA.
          </Typography>
        </Box>

        <Button
          component={Link}
          to="/aluno/simulados/gerar"
          variant="contained"
          size="large"
          startIcon={<Add />}
          sx={{
            borderRadius: "16px",
            py: 2,
            px: 4,
            fontSize: "1.1rem",
            fontWeight: "bold",
            textTransform: "none",
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          }}
        >
          Gerar Novo
        </Button>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress size={60} />
        </Box>
      ) : simulados.length === 0 ? (
        <Paper
          elevation={0}
          className="glass-container"
          sx={{ py: 12, textAlign: "center" }}
        >
          <AutoAwesome sx={{ fontSize: 80, color: "text.disabled", mb: 3 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
            Nenhum simulado ainda
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 500, mx: "auto" }}
          >
            Dê o primeiro passo na sua preparação. Use nossa IA para gerar um
            conjunto de questões focado no que você precisa.
          </Typography>
          <Button
            component={Link}
            to="/aluno/simulados/gerar"
            variant="outlined"
            size="large"
            endIcon={<ArrowForward />}
            sx={{ borderRadius: "12px", fontWeight: "bold" }}
          >
            Começar minha primeira prova
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {simulados.map((s) => {
            const meta = getSubjectMeta(s.materia || "");
            return (
              <Grid key={s._id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Paper
                  component={Link}
                  to={`/aluno/simulados/${s._id}`}
                  elevation={0}
                  className="glass-container"
                  sx={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    height: "100%",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                      "& .hover-arrow": { transform: "translateX(4px)" },
                    },
                  }}
                >
                  {/* Icon Background Decoration */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -20,
                      right: -20,
                      opacity: 0.05,
                      color: `${meta.color}.main`,
                      "& svg": { fontSize: 160 },
                    }}
                  >
                    {meta.icon}
                  </Box>

                  <Box sx={{ position: "relative", zIndex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 4,
                      }}
                    >
                      <Chip
                        label={s.dificuldade}
                        color={getDifficultyColor(s.dificuldade)}
                        size="small"
                        sx={{
                          fontWeight: 900,
                          textTransform: "uppercase",
                          borderRadius: "8px",
                        }}
                      />
                      <Timer sx={{ color: "text.disabled", fontSize: 20 }} />
                    </Box>

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        mb: 1,
                        height: "3.5rem",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {s.nome}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 4,
                        pb: 4,
                        borderBottom: "1px solid",
                        borderColor: "var(--border-color)",
                      }}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: `${meta.color}.main`,
                        }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        {s.materia || "Misto"}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 900, lineHeight: 1 }}
                        >
                          {s.quantidadeQuestoes}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                          }}
                        >
                          Questões
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: "primary.main",
                          fontWeight: 800,
                        }}
                      >
                        <span>Iniciar</span>
                        <ArrowForward
                          className="hover-arrow"
                          sx={{
                            fontSize: 18,
                            transition: "transform 0.3s ease",
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}
