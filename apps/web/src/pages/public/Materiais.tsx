import { Container, Typography, Box } from "@mui/material";
import { Hero } from "src/components/public/Hero";
import { RecursoCard } from "src/components/public/RecursoCard";

export function Materiais() {
  const materiais = [
    {
      tipo: "provas" as const,
      titulo: "Provas ENEM",
      descricao: "Provas e gabaritos do ENEM dos últimos anos",
      googleDriveUrl: "https://drive.google.com/drive/folders/exemplo-enem",
    },
    {
      tipo: "provas" as const,
      titulo: "Provas UEM",
      descricao: "Provas anteriores da Universidade Estadual de Maringá",
      googleDriveUrl: "https://drive.google.com/drive/folders/exemplo-uem",
    },
    {
      tipo: "listas" as const,
      titulo: "Listas de Exercícios",
      descricao: "Exercícios organizados por matéria e nível de dificuldade",
      googleDriveUrl: "https://drive.google.com/drive/folders/exemplo-listas",
    },
    {
      tipo: "informacoes" as const,
      titulo: "Resumos e Mapas Mentais",
      descricao: "Material de apoio para revisão",
      googleDriveUrl: "https://drive.google.com/drive/folders/exemplo-resumos",
    },
    {
      tipo: "notas_corte" as const,
      titulo: "Notas de Corte",
      descricao: "Histórico de notas de corte de todas as universidades",
      googleDriveUrl: "https://drive.google.com/drive/folders/exemplo-notas",
    },
    {
      tipo: "informacoes" as const,
      titulo: "Editais e Cronogramas",
      descricao: "Documentos oficiais dos vestibulares",
      googleDriveUrl: "https://drive.google.com/drive/folders/exemplo-editais",
    },
  ];

  return (
    <>
      <Hero
        titulo="Materiais de Estudo"
        subtitulo="Acesso a uma biblioteca completa de materiais para sua preparação"
        altura="300px"
      />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Biblioteca de Materiais
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Todos os materiais estão organizados e disponíveis no Google Drive
          para fácil acesso. Clique em cada categoria para acessar os arquivos.
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
            mt: 4,
          }}
        >
          {materiais.map((material, index) => (
            <RecursoCard
              key={index}
              tipo={material.tipo}
              titulo={material.titulo}
              descricao={material.descricao}
              googleDriveUrl={material.googleDriveUrl}
            />
          ))}
        </Box>

        <Box sx={{ mt: 8, p: 4, backgroundColor: "grey.100", borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Como usar os materiais
          </Typography>
          <Typography variant="body1" paragraph>
            1. Clique no botão "Acessar no Drive" do material desejado
          </Typography>
          <Typography variant="body1" paragraph>
            2. Você será redirecionado para a pasta no Google Drive
          </Typography>
          <Typography variant="body1" paragraph>
            3. Navegue pelos arquivos e faça download do que precisar
          </Typography>
          <Typography variant="body1">
            4. Organize seus estudos e aproveite ao máximo os materiais!
          </Typography>
        </Box>
      </Container>
    </>
  );
}
