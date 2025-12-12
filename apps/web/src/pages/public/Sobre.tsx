import { Container, Typography, Box, Grid, Avatar } from "@mui/material";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SchoolIcon from "@mui/icons-material/School";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Hero } from "src/components/public/Hero";
import { InfoCard } from "src/components/public/InfoCard";

export function Sobre() {
  return (
    <>
      <Hero
        titulo="Sobre o Prof. Jean Ribeiro"
        subtitulo="Dedicação e excelência na preparação para vestibulares"
        altura="300px"
      />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={6}>
          {/* Foto e Apresentação */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: "center" }}>
              <Avatar
                sx={{
                  width: 200,
                  height: 200,
                  margin: "0 auto",
                  mb: 2,
                  fontSize: 80,
                  backgroundColor: "primary.main",
                }}
              >
                JR
              </Avatar>
              <Typography variant="h5" fontWeight="bold">
                Prof. Jean Ribeiro
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Especialista em Vestibulares
              </Typography>
            </Box>
          </Grid>

          {/* Biografia */}
          <Grid item xs={12} md={8}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Quem sou eu
            </Typography>
            <Typography variant="body1" paragraph>
              Olá! Sou o Professor Jean Ribeiro, educador apaixonado por ajudar
              estudantes a alcançarem seus sonhos de ingressar nas melhores
              universidades do Paraná e do Brasil.
            </Typography>
            <Typography variant="body1" paragraph>
              Com anos de experiência na preparação para vestibulares,
              desenvolvi uma metodologia única que combina conhecimento técnico,
              materiais exclusivos e acompanhamento personalizado para cada
              aluno.
            </Typography>
            <Typography variant="body1" paragraph>
              Minha missão é não apenas ensinar conteúdos, mas formar pensadores
              críticos, preparados para os desafios acadêmicos e profissionais
              que virão.
            </Typography>
          </Grid>
        </Grid>

        {/* Valores */}
        <Box sx={{ mt: 8 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            Meus Valores
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            O que guia meu trabalho
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <InfoCard
                titulo="Excelência"
                descricao="Compromisso com a qualidade em cada aula, material e orientação fornecida"
                icone={<EmojiEventsIcon sx={{ fontSize: 60 }} />}
                cor="primary.main"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoCard
                titulo="Dedicação"
                descricao="Acompanhamento próximo e personalizado para cada estudante"
                icone={<SchoolIcon sx={{ fontSize: 60 }} />}
                cor="secondary.main"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoCard
                titulo="Paixão"
                descricao="Amor genuíno pela educação e pelo sucesso dos meus alunos"
                icone={<FavoriteIcon sx={{ fontSize: 60 }} />}
                cor="error.main"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Resultados */}
        <Box sx={{ mt: 8, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Resultados Comprovados
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="h2" color="primary" fontWeight="bold">
                500+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Alunos Aprovados
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h2" color="primary" fontWeight="bold">
                10+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Anos de Experiência
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h2" color="primary" fontWeight="bold">
                7
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Universidades Cobertas
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
}
