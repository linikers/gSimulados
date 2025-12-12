import { Container, Typography, Box } from "@mui/material";
import { Hero } from "src/components/public/Hero";

export function Marketplace() {
  return (
    <>
      <Hero
        titulo="Marketplace"
        subtitulo="Materiais e cursos exclusivos para sua preparação"
        altura="300px"
      />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Em Desenvolvimento
          </Typography>
          <Typography variant="body1" color="text.secondary">
            O Marketplace estará disponível em breve com materiais exclusivos e
            cursos especializados.
          </Typography>
        </Box>
      </Container>
    </>
  );
}
