import { Container, Grid, Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Hero } from "../../components/public/Hero";
import { VestibularCard } from "../../components/public/VestibularCard";
import { InfoCard } from "../../components/public/InfoCard";
import { vestibulares } from "../../data/vestibulares";
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MenuBookIcon from "@mui/icons-material/MenuBook";

export function Home() {
  const navigate = useNavigate();

  // Pegar os 3 principais vestibulares para destaque
  const vestibularesDestaque = vestibulares.filter((v) =>
    ["enem", "uem", "uel"].includes(v.codigo)
  );

  return (
    <>
      {/* Hero Section */}
      <Hero
        titulo="Mentoria Educacional GS"
        subtitulo="Prepare-se para os principais vestibulares do Paraná e ENEM com orientação especializada"
        ctaTexto="Conheça a Mentoria"
        ctaOnClick={() => navigate("/aulas-e-mentorias")}
      />

      {/* Benefícios */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          Por que escolher nossa mentoria?
        </Typography>
        <Typography
          variant="h6"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Metodologia comprovada e materiais exclusivos
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <InfoCard
              titulo="Material Completo"
              descricao="Acesso a provas anteriores, listas de exercícios e materiais de todas as universidades"
              icone={<MenuBookIcon sx={{ fontSize: 60 }} />}
              cor="primary.main"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard
              titulo="Acompanhamento Personalizado"
              descricao="Mentoria individual focada nas suas necessidades e objetivos"
              icone={<SchoolIcon sx={{ fontSize: 60 }} />}
              cor="secondary.main"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard
              titulo="Resultados Comprovados"
              descricao="Centenas de aprovações nas principais universidades do Paraná"
              icone={<EmojiEventsIcon sx={{ fontSize: 60 }} />}
              cor="success.main"
            />
          </Grid>
        </Grid>
      </Container>

      {/* Vestibulares em Destaque */}
      <Box sx={{ backgroundColor: "grey.100", py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            Vestibulares em Destaque
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            Preparação focada nos principais processos seletivos
          </Typography>

          <Grid container spacing={3}>
            {vestibularesDestaque.map((vestibular) => (
              <Grid item xs={12} sm={6} md={4} key={vestibular.codigo}>
                <VestibularCard
                  codigo={vestibular.codigo}
                  nome={vestibular.nome}
                  nomeCompleto={vestibular.nomeCompleto}
                  cidade={vestibular.cidade}
                  estado={vestibular.estado}
                  proximaData={vestibular.proximaProva?.data}
                  logoUrl={vestibular.logoUrl}
                />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/vestibulares")}
            >
              Ver Todos os Vestibulares
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Call to Action */}
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
          Pronto para começar?
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Entre em contato e descubra como podemos ajudá-lo a alcançar seus
          objetivos
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/aulas-e-mentorias")}
          >
            Conhecer a Mentoria
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/aprovacoes")}
          >
            Ver Aprovações
          </Button>
        </Box>
      </Container>
    </>
  );
}
