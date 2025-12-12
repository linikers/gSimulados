import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { Hero } from "../../components/public/Hero";
import { RecursoCard } from "../../components/public/RecursoCard";
import { getVestibularByCodigo } from "../../data/vestibulares";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export function DetalhesVestibular() {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const vestibular = codigo ? getVestibularByCodigo(codigo) : undefined;

  if (!vestibular) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="h4">Vestibular não encontrado</Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/vestibulares")}
          sx={{ mt: 2 }}
        >
          Voltar para Vestibulares
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Hero
        titulo={vestibular.nomeCompleto}
        subtitulo={vestibular.descricao}
        altura="350px"
      />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Informações Gerais */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Informações Gerais
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <LocationOnIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography>
                    {vestibular.cidade} - {vestibular.estado}
                  </Typography>
                </Box>

                <Typography variant="body1" color="text.secondary" paragraph>
                  {vestibular.descricao}
                </Typography>

                <Button
                  variant="outlined"
                  href={vestibular.siteOficial}
                  target="_blank"
                  rel="noopener noreferrer"
                  endIcon={<OpenInNewIcon />}
                >
                  Site Oficial
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Próxima Prova */}
          <Grid item xs={12} md={4}>
            {vestibular.proximaProva && (
              <Card sx={{ backgroundColor: "primary.main", color: "white" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Próximo Vestibular
                  </Typography>

                  {vestibular.proximaProva.data && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CalendarTodayIcon sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        Prova:{" "}
                        {new Date(
                          vestibular.proximaProva.data
                        ).toLocaleDateString("pt-BR")}
                      </Typography>
                    </Box>
                  )}

                  {vestibular.proximaProva.inscricoes && (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Inscrições:{" "}
                        {new Date(
                          vestibular.proximaProva.inscricoes.inicio
                        ).toLocaleDateString("pt-BR")}{" "}
                        a{" "}
                        {new Date(
                          vestibular.proximaProva.inscricoes.fim
                        ).toLocaleDateString("pt-BR")}
                      </Typography>
                      <Chip
                        label={vestibular.proximaProva.inscricoes.status
                          .replace("_", " ")
                          .toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: "white",
                          color: "primary.main",
                          mb: 2,
                        }}
                      />
                    </>
                  )}

                  {vestibular.proximaProva.taxa && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <AttachMoneyIcon sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        Taxa: R$ {vestibular.proximaProva.taxa.toFixed(2)}
                      </Typography>
                    </Box>
                  )}

                  {vestibular.proximaProva.siteInscricao && (
                    <Button
                      variant="contained"
                      fullWidth
                      href={vestibular.proximaProva.siteInscricao}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        backgroundColor: "white",
                        color: "primary.main",
                        "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
                      }}
                    >
                      Inscreva-se
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Recursos Disponíveis */}
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          Recursos Disponíveis
        </Typography>

        <Grid container spacing={3}>
          {vestibular.recursos.map((recurso, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <RecursoCard
                tipo={recurso.tipo}
                titulo={recurso.titulo}
                descricao={recurso.descricao}
                googleDriveUrl={recurso.googleDriveUrl}
              />
            </Grid>
          ))}
        </Grid>

        {/* Mapa (se tiver coordenadas) */}
        {vestibular.coordenadas && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Localização
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: 400,
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps?q=${vestibular.coordenadas.lat},${vestibular.coordenadas.lng}&z=15&output=embed`}
                allowFullScreen
              />
            </Box>
          </Box>
        )}
      </Container>
    </>
  );
}
