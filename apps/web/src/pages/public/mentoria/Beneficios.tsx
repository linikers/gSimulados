import { Container, Typography, Box } from "@mui/material";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import PsychologyIcon from "@mui/icons-material/Psychology";
import GroupIcon from "@mui/icons-material/Group";
import { Hero } from "src/components/public/Hero";
import { InfoCard } from "src/components/public/InfoCard";

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
            titulo="Resultados Comprovados"
            descricao="Mais de 500 alunos aprovados nas principais universidades do Paraná"
            icone={<TrendingUpIcon sx={{ fontSize: 60 }} />}
            cor="success.main"
          />
          <InfoCard
            titulo="Economia de Tempo"
            descricao="Plano de estudos otimizado para maximizar seu aprendizado"
            icone={<AccessTimeIcon sx={{ fontSize: 60 }} />}
            cor="primary.main"
          />
          <InfoCard
            titulo="Suporte Contínuo"
            descricao="Acompanhamento constante e suporte para todas as suas dúvidas"
            icone={<SupportAgentIcon sx={{ fontSize: 60 }} />}
            cor="info.main"
          />
          <InfoCard
            titulo="Material Exclusivo"
            descricao="Acesso a materiais cuidadosamente selecionados e organizados"
            icone={<LibraryBooksIcon sx={{ fontSize: 60 }} />}
            cor="warning.main"
          />
          <InfoCard
            titulo="Desenvolvimento Pessoal"
            descricao="Não apenas conteúdo, mas também técnicas de estudo e gestão emocional"
            icone={<PsychologyIcon sx={{ fontSize: 60 }} />}
            cor="secondary.main"
          />
          <InfoCard
            titulo="Comunidade"
            descricao="Faça parte de uma rede de estudantes motivados e focados"
            icone={<GroupIcon sx={{ fontSize: 60 }} />}
            cor="error.main"
          />
        </Box>

        <Box sx={{ mt: 8 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            Depoimentos
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, 1fr)",
              },
              gap: 4,
              mt: 2,
            }}
          >
            <Box sx={{ p: 3, backgroundColor: "grey.100", borderRadius: 2 }}>
              <Typography variant="body1" paragraph>
                "A mentoria do Prof. Jean foi fundamental para minha aprovação
                na UEM. O material é excelente e o acompanhamento personalizado
                fez toda a diferença!"
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold">
                Maria Silva
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Aprovada em Medicina - UEM 2024
              </Typography>
            </Box>
            <Box sx={{ p: 3, backgroundColor: "grey.100", borderRadius: 2 }}>
              <Typography variant="body1" paragraph>
                "Consegui organizar meus estudos de forma muito mais eficiente.
                As dicas e estratégias do professor foram essenciais para minha
                aprovação."
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold">
                João Santos
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Aprovado em Engenharia - UFPR 2024
              </Typography>
            </Box>
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
          </Box>
        </Box>
      </Container>
    </>
  );
}
