import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Chip,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";
import { QuestionService, type IQuestion } from "src/services/question.service";

export function ListaQuestoes() {
  const [questoes, setQuestoes] = useState<IQuestion[]>([]);
  const [filterMateria, setFilterMateria] = useState("");
  const [materias, setMaterias] = useState<string[]>([]);

  useEffect(() => {
    loadQuestoes();
  }, [filterMateria]);

  const loadQuestoes = async () => {
    try {
      const data = await QuestionService.list(filterMateria || undefined);
      setQuestoes(data);

      // Extrair matérias únicas
      const uniqueMaterias = Array.from(
        new Set(data.map((q) => q.materia))
      ).sort();
      setMaterias(uniqueMaterias);
    } catch (error) {
      console.error("Erro ao carregar questões:", error);
    }
  };

  const getDificuldadeColor = (dificuldade: string) => {
    switch (dificuldade) {
      case "facil":
        return "success";
      case "medio":
        return "warning";
      case "dificil":
        return "error";
      default:
        return "default";
    }
  };

  const getDificuldadeLabel = (dificuldade: string) => {
    switch (dificuldade) {
      case "facil":
        return "Fácil";
      case "medio":
        return "Médio";
      case "dificil":
        return "Difícil";
      default:
        return dificuldade;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Questões Aprovadas
      </Typography>

      <Typography sx={{ mb: 2 }}>Total: {questoes.length} questões</Typography>

      {/* Filtro */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          select
          label="Filtrar por Matéria"
          value={filterMateria}
          onChange={(e) => setFilterMateria(e.target.value)}
          sx={{ minWidth: 250 }}
        >
          <MenuItem value="">Todas as Matérias</MenuItem>
          {materias.map((materia) => (
            <MenuItem key={materia} value={materia}>
              {materia}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {/* Tabela */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Enunciado</TableCell>
              <TableCell>Matéria</TableCell>
              <TableCell>Assunto</TableCell>
              <TableCell>Dificuldade</TableCell>
              <TableCell>Origem</TableCell>
              <TableCell>Resposta</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questoes.map((questao) => (
              <TableRow key={questao._id}>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 400,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {questao.enunciado}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={questao.materia} color="primary" size="small" />
                </TableCell>
                <TableCell>{questao.assunto}</TableCell>
                <TableCell>
                  <Chip
                    label={getDificuldadeLabel(questao.dificuldade)}
                    color={getDificuldadeColor(questao.dificuldade)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="caption">
                      {questao.origem.vestibular.toUpperCase()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {questao.origem.ano}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={questao.respostaCorreta}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {questoes.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="text.secondary">
            Nenhuma questão aprovada encontrada
          </Typography>
        </Box>
      )}
    </Box>
  );
}
