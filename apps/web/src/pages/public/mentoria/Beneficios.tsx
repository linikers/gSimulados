import { Container, Typography, Grid, Box } from "@mui/material";
import { Hero } from "../../components/public/Hero";
import { InfoCard } from "../../components/public/InfoCard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import PsychologyIcon from "@mui/icons-material/Psychology";
import GroupIcon from "@mui/icons-material/Group";

export function Beneficios() {
  return (
    <>
      <Hero
        titulo="Benefícios da Mentoria"
        subtitulo="Vantagens que fazem a diferença na sua aprovação"
        altura="300px"
      />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          Por que escolher nossa mentoria?
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Conheça os diferenciais que nos tornam referência na preparação para
          vestibulares
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <InfoCard
              titulo="Resultados Comprovados"
              descricao="Mais de 500 alunos aprovados nas principais universidades do Paraná"
              icone={<TrendingUpIcon sx={{ fontSize: 60 }} />}
              cor="success.main"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard
              titulo="Economia de Tempo"
              descricao="Plano de estudos otimizado para maximizar seu aprendizado"
              icone={<AccessTimeIcon sx={{ fontSize: 60 }} />}
              cor="primary.main"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard
              titulo="Suporte Contínuo"
              descricao="Acompanhamento constante e suporte para todas as suas dúvidas"
              icone={<SupportAgentIcon sx={{ fontSize: 60 }} />}
              cor="info.main"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard
              titulo="Material Exclusivo"
              descricao="Acesso a materiais cuidadosamente selecionados e organizados"
              icone={<LibraryBooksIcon sx={{ fontSize: 60 }} />}
              cor="warning.main"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard
              titulo="Desenvolvimento Pessoal"
              descricao="Não apenas conteúdo, mas também técnicas de estudo e gestão emocional"
              icone={<PsychologyIcon sx={{ fontSize: 60 }} />}
              cor="secondary.main"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard
              titulo="Comunidade"
              descricao="Faça parte de uma rede de estudantes motivados e focados"
              icone={<GroupIcon sx={{ fontSize: 60 }} />}
              cor="error.main"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 8 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            Depoimentos
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3, backgroundColor: "grey.100", borderRadius: 2 }}>
                <Typography variant="body1" paragraph>
                  "A mentoria do Prof. Jean foi fundamental para minha aprovação
                  na UEM. O material é excelente e o acompanhamento
                  personalizado fez toda a diferença!"
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold">
                  Maria Silva
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Aprovada em Medicina - UEM 2024
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3, backgroundColor: "grey.100", borderRadius: 2 }}>
                <Typography variant="body1" paragraph>
                  "Consegui organizar meus estudos de forma muito mais
                  eficiente. As dicas e estratégias do professor foram
                  essenciais para minha aprovação."
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold">
                  João Santos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Aprovado em Engenharia - UFPR 2024
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3, backgroundColor: "grey.100", borderRadius: 2 }}>
                <Typography variant="body1" paragraph>
                  "O suporte emocional e a orientação vocacional me ajudaram não
                  só a passar, mas a escolher o curso certo para mim. Muito
                  obrigada!"
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold">
                  Ana Paula
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Aprovada em Direito - UEL 2024
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
}
