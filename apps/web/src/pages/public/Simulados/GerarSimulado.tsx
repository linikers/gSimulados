import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Slider,
  Button,
  CircularProgress,
  Paper,
  Grid,
} from "@mui/material";
import { SimuladoService } from "../../../services/simulado.service";
import { useNavigate } from "react-router-dom";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import {
  AutoAwesome,
  School,
  FormatListNumbered,
  Psychology,
  ArrowForward,
} from "@mui/icons-material";

export default function GerarSimulado() {
  const [nome, setNome] = useState("");
  const [materia, setMateria] = useState("");
  const [dificuldade, setDificuldade] = useState<
    "facil" | "medio" | "dificil" | "misto"
  >("misto");
  const [quantidade, setQuantidade] = useState(10);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await SimuladoService.generate({
        nome,
        materia,
        dificuldade,
        quantidade,
      });
      navigate(`/aluno/simulados/${result._id}`);
    } catch (error) {
      handleError(error, "Erro ao gerar seu simulado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box className="simulado-header">
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 10,
            bgcolor: "primary.main",
            color: "white",
            mb: 3,
            fontSize: "0.875rem",
            fontWeight: "bold",
          }}
        >
          <AutoAwesome fontSize="small" />
          IA Geradora Ativa
        </Box>
        <Typography
          variant="h3"
          component="h1"
          className="simulado-title"
          sx={{ fontWeight: 800 }}
        >
          Crie seu Simulado
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            fontSize: "1.2rem",
            maxWidth: 600,
            mx: "auto",
          }}
        >
          Personalize sua experiência de estudo com questões selecionadas por
          nossa inteligência artificial.
        </Typography>
      </Box>

      <Paper
        className="glass-container"
        elevation={0}
        sx={{ p: { xs: 3, md: 6 } }}
      >
        <form onSubmit={handleGenerate}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <Box className="form-label">
                <School color="primary" />
                Nome do Simulado
              </Box>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ex: Revisão Fuvest - Matemática"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    bgcolor: "var(--input-bg)",
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box className="form-label">
                <Psychology color="primary" />
                Matéria
              </Box>
              <FormControl fullWidth>
                <Select
                  value={materia}
                  onChange={(e) => setMateria(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: "12px", bgcolor: "var(--input-bg)" }}
                >
                  <MenuItem value="">✨ Todas as Matérias</MenuItem>
                  <MenuItem value="Matemática">Matemática</MenuItem>
                  <MenuItem value="Física">Física</MenuItem>
                  <MenuItem value="Química">Química</MenuItem>
                  <MenuItem value="Biologia">Biologia</MenuItem>
                  <MenuItem value="Português">Português</MenuItem>
                  <MenuItem value="História">História</MenuItem>
                  <MenuItem value="Geografia">Geografia</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box className="form-label">
                <AutoAwesome color="primary" />
                Dificuldade
              </Box>
              <FormControl fullWidth>
                <Select
                  value={dificuldade}
                  onChange={(e) => setDificuldade(e.target.value as any)}
                  sx={{ borderRadius: "12px", bgcolor: "var(--input-bg)" }}
                >
                  <MenuItem value="misto">🌊 Misto / Equilibrado</MenuItem>
                  <MenuItem value="facil">🟢 Fácil / Base</MenuItem>
                  <MenuItem value="medio">🟡 Médio / Desafio</MenuItem>
                  <MenuItem value="dificil">🔴 Difícil / Elite</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box className="form-label" sx={{ mb: 0 }}>
                  <FormatListNumbered color="primary" />
                  Quantidade de Questões
                </Box>
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontWeight: 800 }}
                >
                  {quantidade}
                </Typography>
              </Box>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={quantidade}
                  onChange={(_, val) => setQuantidade(val as number)}
                  min={5}
                  max={50}
                  step={5}
                  marks={[
                    { value: 5, label: "5" },
                    { value: 25, label: "25" },
                    { value: 50, label: "50" },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                endIcon={!loading && <ArrowForward />}
                sx={{
                  py: 2,
                  borderRadius: "12px",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  textTransform: "none",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                }}
              >
                {loading ? (
                  <CircularProgress size={28} color="inherit" />
                ) : (
                  "Gerar Simulado Agora ✨"
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Typography
        variant="body2"
        sx={{ textAlign: "center", mt: 4, color: "text.secondary" }}
      >
        O simulado será orquestrado instantaneamente e ficará disponível em sua
        dashboard.
      </Typography>
    </Container>
  );
}
