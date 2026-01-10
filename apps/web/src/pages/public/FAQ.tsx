import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; // Ícone padrão (se não tiver, usaremos texto ou verificar imports)
import { useState } from "react";

// Dados mockados das perguntas
const faqEscola = [
  {
    pergunta: "Como cadastro minha escola?",
    resposta:
      "Entre em contato com nossa equipe comercial ou faça o pré-cadastro na página inicial. Após validação, você receberá acesso ao painel administrativo.",
  },
  {
    pergunta: "Como cadastro meus alunos?",
    resposta:
      "No painel da escola, vá em 'Alunos' > 'Cadastrar'. Você também pode importar alunos em massa via planilha.",
  },
  {
    pergunta: "Posso criar simulados personalizados?",
    resposta:
      "Sim! No menu 'Vestibulares', você pode montar provas escolhendo questões por matéria, dificuldade e ano.",
  },
];

const faqAluno = [
  {
    pergunta: "Como acesso meus simulados?",
    resposta:
      "Faça login e acesse seu Dashboard. Lá estarão listados os simulados pendentes e os já realizados.",
  },
  {
    pergunta: "Esqueci minha senha, o que fazer?",
    resposta:
      "Na tela de login, clique em 'Esqueci minha senha' para receber um link de redefinição no seu e-mail cadastrado.",
  },
  {
    pergunta: "Como vejo meu desempenho?",
    resposta:
      "Após finalizar um simulado, o sistema gera automaticamente um relatório de desempenho comparativo.",
  },
];

export function FAQ() {
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        Perguntas Frequentes
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" paragraph>
        Tire suas dúvidas sobre o gSimulados
      </Typography>

      <Paper sx={{ mt: 4, mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Para Escolas" />
          <Tab label="Para Alunos" />
        </Tabs>
      </Paper>

      <Box role="tabpanel" hidden={tabValue !== 0}>
        {tabValue === 0 && (
          <Box>
            {faqEscola.map((item, index) => (
              <Accordion key={index}>
                <AccordionSummary
                  expandIcon={<span>▼</span>} // Usando span simples para evitar erro de ícone faltando
                  aria-controls={`panel-escola-${index}-content`}
                  id={`panel-escola-${index}-header`}
                >
                  <Typography fontWeight="bold">{item.pergunta}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{item.resposta}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Box>

      <Box role="tabpanel" hidden={tabValue !== 1}>
        {tabValue === 1 && (
          <Box>
            {faqAluno.map((item, index) => (
              <Accordion key={index}>
                <AccordionSummary
                  expandIcon={<span>▼</span>}
                  aria-controls={`panel-aluno-${index}-content`}
                  id={`panel-aluno-${index}-header`}
                >
                  <Typography fontWeight="bold">{item.pergunta}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{item.resposta}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Box>

      <Box textAlign="center" mt={8}>
        <Typography variant="body1">
          Ainda tem dúvidas? <a href="/contato">Fale Conosco</a>
        </Typography>
      </Box>
    </Container>
  );
}
