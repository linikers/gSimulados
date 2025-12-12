import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
// import { Hero } from "../../components/public/Hero";
// import { processosSeriados } from "../../data/seriados";
import SchoolIcon from "@mui/icons-material/School";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { Hero } from "src/components/public/Hero";

export function ListaSeriados() {
  const navigate = useNavigate();

  return (
    <>
      <Hero
        titulo="Processos Seriados"
        subtitulo="Ingresso progressivo nas universidades através de avaliações ao longo do ensino médio"
        altura="300px"
      />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          O que são Processos Seriados?
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Os processos seriados são formas de ingresso nas universidades que
          avaliam o estudante ao longo dos três anos do ensino médio, geralmente
          com uma prova ao final de cada ano. Ao final do processo, a nota
          acumulada pode garantir a vaga na universidade.
        </Typography>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Processos Disponíveis
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {processosSeriados.map((seriado) => (
              <Grid item xs={12} md={4} key={seriado.codigo}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <SchoolIcon
                        sx={{ fontSize: 40, mr: 2, color: "primary.main" }}
                      />
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {seriado.nome}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {seriado.universidade}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" paragraph>
                      {seriado.descricao}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Fases:</strong> {seriado.fases}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Duração:</strong> {seriado.duracaoAnos} anos
                    </Typography>

                    {seriado.proximaProva?.data && (
                      <Box
                        sx={{ mt: 2, display: "flex", alignItems: "center" }}
                      >
                        <CalendarTodayIcon
                          sx={{ fontSize: 16, mr: 1, color: "primary.main" }}
                        />
                        <Typography variant="body2" color="primary">
                          Próxima prova:{" "}
                          {new Date(
                            seriado.proximaProva.data
                          ).toLocaleDateString("pt-BR")}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <Box sx={{ p: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate(`/seriados/${seriado.codigo}`)}
                    >
                      Ver Detalhes
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box
          sx={{ mt: 8, p: 4, backgroundColor: "info.light", borderRadius: 2 }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Vantagens dos Processos Seriados
          </Typography>
          <ul>
            <li>
              <Typography variant="body1">
                Distribuição da pressão ao longo dos três anos do ensino médio
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                Possibilidade de ingresso sem precisar fazer o vestibular
                tradicional
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                Avaliação contínua do aprendizado
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                Oportunidade de melhorar o desempenho a cada etapa
              </Typography>
            </li>
          </ul>
        </Box>
      </Container>
    </>
  );
}
