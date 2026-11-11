import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TuneIcon from "@mui/icons-material/Tune";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useAuth } from "../../../hooks/useAuth";

const recursos = [
  {
    titulo: "Questões do seu vestibular",
    descricao:
      "O simulado é montado com questões reais do vestibular e do ano que você escolher.",
    icone: <AutoAwesomeIcon sx={{ fontSize: 44 }} />,
  },
  {
    titulo: "Você escolhe o formato",
    descricao:
      "Defina matérias, quantidade de questões e nível de dificuldade antes de gerar.",
    icone: <TuneIcon sx={{ fontSize: 44 }} />,
  },
  {
    titulo: "Resultado na hora",
    descricao:
      "Responda, veja a correção e acompanhe sua evolução no histórico de simulados.",
    icone: <QueryStatsIcon sx={{ fontSize: 44 }} />,
  },
];

const passos = [
  {
    titulo: "1. Monte o simulado",
    texto: "Escolha o vestibular, as matérias e a dificuldade.",
  },
  {
    titulo: "2. Responda online",
    texto: "Faça as questões direto no navegador, no seu ritmo.",
  },
  {
    titulo: "3. Veja a correção",
    texto: "Confira o gabarito e o seu desempenho por matéria.",
  },
];

export function SimuladosPublico() {
  const navigate = useNavigate();
  const { signed, user } = useAuth();

  const podeUsar = signed && user?.role !== "escola";

  return (
    <Box>
      {/* Apresentação */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0D47A1 0%, #1565C0 60%, #1E88E5 100%)",
          color: "#FFFFFF",
          pt: { xs: 14, md: 18 },
          pb: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="overline"
            sx={{ letterSpacing: 2, opacity: 0.85 }}
          >
            G-Simulados
          </Typography>
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: 900, mb: 2, fontSize: { xs: "2rem", md: "3rem" } }}
          >
            Simulados feitos para o seu vestibular
          </Typography>
          <Typography
            variant="h6"
            sx={{ maxWidth: 720, opacity: 0.95, fontWeight: 400 }}
          >
            Gere simulados com questões do vestibular que você vai prestar,
            responda online e receba a correção na hora — sem montar prova à mão.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mt: 5 }}
          >
            {podeUsar ? (
              <>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/aluno/simulados")}
                  sx={{ fontSize: "1rem" }}
                >
                  Ir para meus simulados
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/aluno/simulados/gerar")}
                  sx={{
                    color: "#FFFFFF",
                    borderColor: "rgba(255,255,255,0.8)",
                    "&:hover": {
                      borderColor: "#FFFFFF",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Gerar simulado agora
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  onClick={() => navigate("/planos")}
                  sx={{ fontSize: "1rem" }}
                >
                  Ver planos e assinar com PIX
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/login")}
                  sx={{
                    color: "#FFFFFF",
                    borderColor: "rgba(255,255,255,0.8)",
                    "&:hover": {
                      borderColor: "#FFFFFF",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Entrar na minha conta
                </Button>
              </>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Recursos */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          fontWeight={800}
          gutterBottom
        >
          O que o simulado faz por você
        </Typography>
        <Typography
          variant="h6"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6, fontWeight: 400 }}
        >
          Treino com cara de prova, no formato do vestibular que você vai fazer.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 3,
          }}
        >
          {recursos.map((recurso) => (
            <Paper
              key={recurso.titulo}
              elevation={0}
              className="glass-container"
              sx={{
                p: 4,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Box sx={{ color: "primary.main" }}>{recurso.icone}</Box>
              <Typography variant="h6" fontWeight={700}>
                {recurso.titulo}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {recurso.descricao}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* Como funciona */}
      <Box sx={{ backgroundColor: "grey.100", py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            textAlign="center"
            fontWeight={800}
            gutterBottom
          >
            Como funciona
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6, fontWeight: 400 }}
          >
            Três passos, do zero à correção.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {passos.map((passo) => (
              <Paper key={passo.titulo} elevation={0} sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {passo.titulo}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {passo.texto}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Chamada final */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h4" component="h2" fontWeight={800} gutterBottom>
          Pronto para treinar?
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
          {podeUsar
            ? "Seus simulados estão no painel do aluno."
            : "Assine com PIX e libere os simulados agora, ou entre se já tem conta."}
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
        >
          {podeUsar ? (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/aluno/simulados")}
            >
              Meus simulados
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/planos")}
              >
                Ver planos e assinar com PIX
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/login")}
              >
                Entrar
              </Button>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
