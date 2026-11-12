import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { FaqService } from "../../services/faq.service";
import type { FaqCategoria, FaqPayload, IFaq } from "../../services/faq.service";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { useToast } from "../../store/useToast";

const vazio: FaqPayload = {
  pergunta: "",
  resposta: "",
  categoria: "geral",
  ordem: 0,
  publicado: true,
};

const categorias: FaqCategoria[] = ["escola", "aluno", "geral"];

export function AdminFAQ() {
  const [itens, setItens] = useState<IFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<IFaq | null>(null);
  const [form, setForm] = useState<FaqPayload>(vazio);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState<IFaq | null>(null);
  const { handleError } = useErrorHandler();
  const { showToast } = useToast();

  const carregar = useCallback(async () => {
    try {
      setItens(await FaqService.listarAdmin());
    } catch (error) {
      handleError(error, "Erro ao carregar o FAQ.");
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrirNova = () => {
    setEditando(null);
    setForm({ ...vazio, ordem: itens.length + 1 });
    setDialogAberto(true);
  };

  const abrirEdicao = (item: IFaq) => {
    setEditando(item);
    setForm({
      pergunta: item.pergunta,
      resposta: item.resposta,
      categoria: item.categoria,
      ordem: item.ordem,
      publicado: item.publicado,
    });
    setDialogAberto(true);
  };

  const salvar = async () => {
    setSalvando(true);
    try {
      if (editando) {
        await FaqService.atualizar(editando._id, form);
        showToast("Pergunta atualizada.", "success");
      } else {
        await FaqService.criar(form);
        showToast("Pergunta criada.", "success");
      }
      setDialogAberto(false);
      await carregar();
    } catch (error) {
      handleError(error, "Erro ao salvar a pergunta.");
    } finally {
      setSalvando(false);
    }
  };

  const alternarPublicado = async (item: IFaq) => {
    try {
      await FaqService.atualizar(item._id, { ...item, publicado: !item.publicado });
      await carregar();
    } catch (error) {
      handleError(error, "Erro ao alterar a publicação.");
    }
  };

  const confirmarExclusao = async () => {
    if (!excluindo) return;
    try {
      await FaqService.remover(excluindo._id);
      showToast("Pergunta removida.", "info");
      setExcluindo(null);
      await carregar();
    } catch (error) {
      handleError(error, "Erro ao remover a pergunta.");
    }
  };

  const importarModelo = async () => {
    try {
      const { criados } = await FaqService.seed();
      showToast(
        criados ? `${criados} perguntas importadas.` : "Já existe conteúdo no FAQ.",
        criados ? "success" : "info",
      );
      await carregar();
    } catch (error) {
      handleError(error, "Erro ao importar o conteúdo inicial.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress size={56} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            FAQ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Perguntas publicadas aqui aparecem em /faq, agrupadas por categoria.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {itens.length === 0 && (
            <Button variant="outlined" onClick={importarModelo}>
              Importar perguntas atuais
            </Button>
          )}
          <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNova}>
            Nova pergunta
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} elevation={0} className="glass-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Ordem</TableCell>
              <TableCell>Pergunta</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Publicado</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {itens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  Nenhuma pergunta cadastrada. Use “Importar perguntas atuais” ou crie a primeira.
                </TableCell>
              </TableRow>
            ) : (
              itens.map((item) => (
                <TableRow key={item._id}>
                  <TableCell align="center">{item.ordem}</TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{item.pergunta}</Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", maxWidth: 520, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {item.resposta}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={item.categoria} />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.publicado}
                      onChange={() => alternarPublicado(item)}
                      inputProps={{ "aria-label": "publicado" }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <Button size="small" onClick={() => abrirEdicao(item)}>
                      Editar
                    </Button>
                    <Button size="small" color="error" onClick={() => setExcluindo(item)}>
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editando ? "Editar pergunta" : "Nova pergunta"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Pergunta"
            value={form.pergunta}
            onChange={(e) => setForm({ ...form, pergunta: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Resposta"
            multiline
            minRows={4}
            value={form.resposta}
            onChange={(e) => setForm({ ...form, resposta: e.target.value })}
          />
          <Box sx={{ display: "flex", gap: 2, mt: 1, alignItems: "center", flexWrap: "wrap" }}>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Categoria</InputLabel>
              <Select
                label="Categoria"
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value as FaqCategoria })}
              >
                {categorias.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Ordem"
              type="number"
              value={form.ordem}
              onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })}
              sx={{ width: 120 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.publicado}
                  onChange={(e) => setForm({ ...form, publicado: e.target.checked })}
                />
              }
              label="Publicado"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(excluindo)} onClose={() => setExcluindo(null)}>
        <DialogTitle>Excluir pergunta?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            “{excluindo?.pergunta}” será removida de vez. Se quiser só esconder,
            desligue “Publicado”.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExcluindo(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmarExclusao}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
