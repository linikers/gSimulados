import { Container, Typography, Box, Avatar } from "@mui/material";

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
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "4fr 8fr",
            },
            gap: 6,
          }}
        >
          {/* Foto e Apresentação */}
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

          {/* Biografia */}
          <Box>
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
          </Box>
        </Box>

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

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, 1fr)",
              },
              gap: 4,
            }}
          >
            <InfoCard
              titulo="Excelência"
              descricao="Compromisso com a qualidade em cada aula, material e orientação fornecida"
              icone={<EmojiEventsIcon sx={{ fontSize: 60 }} />}
              cor="primary.main"
            />
            <InfoCard
              titulo="Dedicação"
              descricao="Acompanhamento próximo e personalizado para cada estudante"
              icone={<SchoolIcon sx={{ fontSize: 60 }} />}
              cor="secondary.main"
            />
            <InfoCard
              titulo="Paixão"
              descricao="Amor genuíno pela educação e pelo sucesso dos meus alunos"
              icone={<FavoriteIcon sx={{ fontSize: 60 }} />}
              cor="error.main"
            />
          </Box>
        </Box>

        {/* Resultados */}
        <Box sx={{ mt: 8, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Resultados Comprovados
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(3, 1fr)",
              },
              gap: 4,
              mt: 2,
            }}
          >
            <Box>
              <Typography variant="h2" color="primary" fontWeight="bold">
                500+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Alunos Aprovados
              </Typography>
            </Box>
            <Box>
              <Typography variant="h2" color="primary" fontWeight="bold">
                10+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Anos de Experiência
              </Typography>
            </Box>
            <Box>
              <Typography variant="h2" color="primary" fontWeight="bold">
                7
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Universidades Cobertas
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}
