import { Container, Typography, Box } from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import TimerIcon from "@mui/icons-material/Timer";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useNavigate } from "react-router-dom";
import { Hero } from "src/components/public/Hero";
import { InfoCard } from "src/components/public/InfoCard";

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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, 1fr)",
            },
            gap: 4,
            mt: 4,
          }}
        >
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
          <InfoCard
            titulo="Cronômetro de Estudos"
            descricao="Gerencie seu tempo de estudo com eficiência (em breve)"
            icone={<TimerIcon sx={{ fontSize: 60 }} />}
            cor="secondary.main"
          />
          <InfoCard
            titulo="Simulados Online"
            descricao="Pratique com simulados no formato dos vestibulares (em breve)"
            icone={<AssessmentIcon sx={{ fontSize: 60 }} />}
            cor="success.main"
          />
        </Box>

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
