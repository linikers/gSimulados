import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Paper,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { FaqService } from "../../services/faq.service";
import type { FaqCategoria, IFaq } from "../../services/faq.service";

const CATEGORIAS: { chave: FaqCategoria; rotulo: string }[] = [
  { chave: "escola", rotulo: "Para Escolas" },
  { chave: "aluno", rotulo: "Para Alunos" },
  { chave: "geral", rotulo: "Geral" },
];

export function FAQ() {
  const [itens, setItens] = useState<IFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    FaqService.publico()
      .then(setItens)
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, []);

  const abas = CATEGORIAS.filter((categoria) =>
    itens.some((item) => item.categoria === categoria.chave),
  );

  // Se a categoria da aba sumir (item despublicado), mostra a primeira sem
  // precisar de efeito/segundo render.
  const indiceAba = tabValue < abas.length ? tabValue : 0;
  const abaAtual = abas[indiceAba];
  const perguntas = abaAtual
    ? itens.filter((item) => item.categoria === abaAtual.chave)
    : [];

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        Perguntas Frequentes
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" paragraph>
        Tire suas dúvidas sobre o G-Simulados
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : erro ? (
        <Alert severity="error" sx={{ mt: 4 }}>
          Não foi possível carregar as perguntas agora. Tente recarregar a página.
        </Alert>
      ) : abas.length === 0 ? (
        <Paper elevation={0} className="glass-container" sx={{ mt: 4, p: 5, textAlign: "center" }}>
          <Typography color="text.secondary">
            Ainda não há perguntas publicadas. Fale com o suporte pelo WhatsApp
            informado na página de planos.
          </Typography>
        </Paper>
      ) : (
        <>
          <Paper sx={{ mt: 4, mb: 4 }}>
            <Tabs
              value={indiceAba}
              onChange={(_event, novo) => setTabValue(novo)}
              indicatorColor="primary"
              textColor="primary"
              centered
              variant="scrollable"
              allowScrollButtonsMobile
            >
              {abas.map((aba) => (
                <Tab key={aba.chave} label={aba.rotulo} />
              ))}
            </Tabs>
          </Paper>

          <Box role="tabpanel">
            {perguntas.map((item, index) => (
              <Accordion key={item._id} defaultExpanded={index === 0}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel-${item._id}-content`}
                  id={`panel-${item._id}-header`}
                >
                  <Typography fontWeight="bold">{item.pergunta}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ whiteSpace: "pre-line" }}>
                    {item.resposta}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </>
      )}

      <Box textAlign="center" mt={8}>
        <Typography variant="body1" color="text.secondary">
          Ainda tem dúvidas? Fale com o suporte pelo WhatsApp informado na página
          de planos.
        </Typography>
      </Box>
    </Container>
  );
}
