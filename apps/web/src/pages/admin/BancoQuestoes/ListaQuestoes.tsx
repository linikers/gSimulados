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
  TablePagination,
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    QuestionService.listMaterias()
      .then(setMaterias)
      .catch(() => setMaterias([]));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadQuestoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMateria, page, rowsPerPage]);

  const loadQuestoes = async () => {
    try {
      const data = await QuestionService.listPaginado({
        materia: filterMateria || undefined,
        page: page + 1,
        limit: rowsPerPage,
      });
      setQuestoes(data.items);
      setTotal(data.total);
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

      <Typography sx={{ mb: 2 }}>Total: {total} questões</Typography>

      {/* Filtro */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          select
          label="Filtrar por Matéria"
          value={filterMateria}
          onChange={(e) => {
            setFilterMateria(e.target.value);
            setPage(0);
          }}
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

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, novaPagina) => setPage(novaPagina)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(Number.parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Linhas por página"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} de ${count}`
        }
      />

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
