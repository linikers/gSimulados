import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Hero } from "src/components/public/Hero";

export function Aprovacoes() {
  // Dados de exemplo - depois virão do backend
  const aprovados = [
    {
      nome: "Maria Silva",
      curso: "Medicina",
      universidade: "UEM",
      ano: 2024,
      foto: "",
    },
    {
      nome: "João Santos",
      curso: "Engenharia Civil",
      universidade: "UFPR",
      ano: 2024,
      foto: "",
    },
    {
      nome: "Ana Paula",
      curso: "Direito",
      universidade: "UEL",
      ano: 2024,
      foto: "",
    },
    {
      nome: "Pedro Oliveira",
      curso: "Ciência da Computação",
      universidade: "UEM",
      ano: 2023,
      foto: "",
    },
    {
      nome: "Juliana Costa",
      curso: "Psicologia",
      universidade: "UEPG",
      ano: 2023,
      foto: "",
    },
    {
      nome: "Carlos Mendes",
      curso: "Arquitetura",
      universidade: "UFPR",
      ano: 2023,
      foto: "",
    },
  ];

  return (
    <>
      <Hero
        titulo="Aprovações"
        subtitulo="Conheça alguns dos nossos alunos aprovados"
        altura="300px"
      />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <EmojiEventsIcon
            sx={{ fontSize: 80, color: "primary.main", mb: 2 }}
          />
          <Typography variant="h3" fontWeight="bold" color="primary">
            500+
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Alunos Aprovados
          </Typography>
        </Box>

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Galeria de Aprovados
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          paragraph
          sx={{ mb: 4 }}
        >
          Confira alguns dos nossos alunos que conquistaram suas vagas nas
          principais universidades.
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
          {aprovados.map((aprovado, index) => (
            <Card key={index}>
              <CardContent sx={{ textAlign: "center" }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    margin: "0 auto",
                    mb: 2,
                    backgroundColor: "primary.main",
                    fontSize: 40,
                  }}
                >
                  {aprovado.nome
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  {aprovado.nome}
                </Typography>
                <Typography variant="body2" color="primary" fontWeight="medium">
                  {aprovado.curso}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {aprovado.universidade} - {aprovado.ano}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box
          sx={{
            mt: 8,
            p: 4,
            backgroundColor: "success.light",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Você pode ser o próximo!
          </Typography>
          <Typography variant="body1">
            Junte-se aos centenas de alunos que já conquistaram suas vagas nas
            melhores universidades com nossa mentoria. Seu sucesso é nosso
            objetivo!
          </Typography>
        </Box>
      </Container>
    </>
  );
}
