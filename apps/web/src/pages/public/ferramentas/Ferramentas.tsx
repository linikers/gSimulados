import { Container, Typography, Grid, Box } from "@mui/material";
import { Hero } from "../../components/public/Hero";
import { InfoCard } from "../../components/public/InfoCard";
import CalculateIcon from "@mui/icons-material/Calculate";
import TimerIcon from "@mui/icons-material/Timer";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useNavigate } from "react-router-dom";

export function Ferramentas() {
  const navigate = useNavigate();

  return (
    <>
      <Hero
        titulo="Ferramentas"
        subtitulo="Recursos para otimizar seus estudos e preparação"
        altura="300px"
      />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Ferramentas Disponíveis
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Utilize nossas ferramentas para melhorar sua preparação e acompanhar
          seu progresso.
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Box
              onClick={() => navigate("/ferramentas/marketplace")}
              sx={{ cursor: "pointer" }}
            >
              <InfoCard
                titulo="Marketplace"
                descricao="Acesse materiais exclusivos e cursos especializados"
                icone={<CalculateIcon sx={{ fontSize: 60 }} />}
                cor="primary.main"
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard
              titulo="Cronômetro de Estudos"
              descricao="Gerencie seu tempo de estudo com eficiência (em breve)"
              icone={<TimerIcon sx={{ fontSize: 60 }} />}
              cor="secondary.main"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard
              titulo="Simulados Online"
              descricao="Pratique com simulados no formato dos vestibulares (em breve)"
              icone={<AssessmentIcon sx={{ fontSize: 60 }} />}
              cor="success.main"
            />
          </Grid>
        </Grid>

        <Box
          sx={{ mt: 8, p: 4, backgroundColor: "info.light", borderRadius: 2 }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Mais ferramentas em breve!
          </Typography>
          <Typography variant="body1">
            Estamos constantemente desenvolvendo novas ferramentas para ajudar
            você em sua preparação. Fique atento às novidades!
          </Typography>
        </Box>
      </Container>
    </>
  );
}
