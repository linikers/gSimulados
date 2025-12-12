import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { getVestibularByCodigo } from "src/data/vestibulares";
import { Hero } from "src/components/public/Hero";
import { RecursoCard } from "src/components/public/RecursoCard";

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
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "2fr 1fr",
            },
            gap: 4,
            mb: 6,
          }}
        >
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

          {/* Próxima Prova */}
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
        </Box>

        {/* Recursos Disponíveis */}
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          Recursos Disponíveis
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {vestibular.recursos.map((recurso, index) => (
            <RecursoCard
              key={index}
              tipo={recurso.tipo}
              titulo={recurso.titulo}
              descricao={recurso.descricao}
              googleDriveUrl={recurso.googleDriveUrl}
            />
          ))}
        </Box>

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
