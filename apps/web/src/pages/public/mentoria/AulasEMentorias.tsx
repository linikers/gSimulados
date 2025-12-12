import {
  Container,
  Typography,
  Grid,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import GroupsIcon from "@mui/icons-material/Groups";
import { Hero } from "src/components/public/Hero";
import { InfoCard } from "src/components/public/InfoCard";

export function AulasEMentorias() {
  return (
    <>
      <Hero
        titulo="Aulas e Mentorias"
        subtitulo="Preparação completa e personalizada para seu vestibular"
        altura="300px"
      />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Como Funciona a Mentoria
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Nossa mentoria oferece um acompanhamento completo e personalizado,
          focado nas suas necessidades específicas e no vestibular que você
          deseja prestar.
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <InfoCard
              titulo="Aulas Individuais"
              descricao="Sessões personalizadas focadas nas suas dificuldades e objetivos"
              icone={<VideoLibraryIcon sx={{ fontSize: 60 }} />}
              cor="primary.main"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoCard
              titulo="Aulas em Grupo"
              descricao="Turmas reduzidas para melhor aproveitamento e interação"
              icone={<GroupsIcon sx={{ fontSize: 60 }} />}
              cor="secondary.main"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            O que está incluído
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Acesso a todo material didático"
                    secondary="Provas anteriores, listas de exercícios e resumos"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Acompanhamento personalizado"
                    secondary="Plano de estudos adaptado ao seu perfil"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Correção de redações"
                    secondary="Feedback detalhado e orientações"
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Simulados periódicos"
                    secondary="Avaliações no formato dos vestibulares"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Suporte contínuo"
                    secondary="Tire dúvidas a qualquer momento"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Orientação vocacional"
                    secondary="Ajuda na escolha do curso e universidade"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Box>

        <Box
          sx={{
            mt: 8,
            p: 4,
            backgroundColor: "primary.main",
            color: "white",
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Metodologia Diferenciada
          </Typography>
          <Typography variant="body1" paragraph>
            Nossa metodologia combina o melhor do ensino tradicional com
            técnicas modernas de aprendizagem, focando não apenas no conteúdo,
            mas também no desenvolvimento de habilidades essenciais como
            interpretação de texto, raciocínio lógico e gestão de tempo.
          </Typography>
          <Typography variant="body1">
            Cada aluno recebe um plano de estudos personalizado, baseado em suas
            forças e fraquezas, garantindo o melhor aproveitamento do tempo de
            preparação.
          </Typography>
        </Box>
      </Container>
    </>
  );
}
