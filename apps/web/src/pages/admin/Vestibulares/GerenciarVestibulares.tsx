import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Button,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import {
  VestibularesService,
  type IVestibular,
} from "../../../services/vestibulares.service";
import { useToast } from "../../../store/useToast";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SyncIcon from "@mui/icons-material/Sync";

export function GerenciarVestibulares() {
  const [vestibulares, setVestibulares] = useState<IVestibular[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const loadVestibulares = useCallback(async () => {
    try {
      const data = await VestibularesService.list();
      setVestibulares(data);
    } catch (error) {
      showToast(`Erro ao carregar vestibulares: ${error}`);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadVestibulares();
  }, [loadVestibulares]);

  const handleDelete = async (codigo: string, nome: string) => {
    if (!window.confirm(`Deseja realmente excluir ${nome}?`)) return;

    try {
      await VestibularesService.delete(codigo);
      showToast("Vestibular removido com sucesso", "success");
      loadVestibulares();
    } catch (error) {
      showToast(`Erro ao remover vestibular: ${error}`);
    }
  };

  const handleSync = async () => {
    if (
      !window.confirm(
        "Deseja sincronizar vestibulares? Isso pode levar alguns segundos."
      )
    )
      return;

    try {
      setLoading(true);
      const result = await VestibularesService.sync();
      showToast(
        `Sincronização concluída! Criados: ${result.created}, Atualizados: ${result.updated}, Ignorados: ${result.skipped}`,
        "success"
      );
      loadVestibulares();
    } catch (error) {
      showToast(`Erro ao sincronizar: ${error}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4">Gerenciar Vestibulares</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<SyncIcon />}
            onClick={handleSync}
            disabled={loading}
          >
            Sincronizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/admin/vestibulares/cadastro")}
          >
            Novo Vestibular
          </Button>
        </Stack>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Nome Completo</TableCell>
              <TableCell>Cidade/Estado</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vestibulares.map((vestibular) => (
              <TableRow key={vestibular._id}>
                <TableCell>
                  <Chip label={vestibular.codigo.toUpperCase()} size="small" />
                </TableCell>
                <TableCell>{vestibular.nome}</TableCell>
                <TableCell>{vestibular.nomeCompleto}</TableCell>
                <TableCell>
                  {vestibular.cidade && vestibular.estado
                    ? `${vestibular.cidade}/${vestibular.estado}`
                    : "-"}
                </TableCell>
                <TableCell>
                  <Chip
                    label={vestibular.ativo ? "Ativo" : "Inativo"}
                    color={vestibular.ativo ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    href={vestibular.siteOficial}
                    target="_blank"
                    title="Site Oficial"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      navigate(
                        `/admin/vestibulares/editar/${vestibular.codigo}`
                      )
                    }
                    title="Editar"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      handleDelete(vestibular.codigo, vestibular.nome)
                    }
                    title="Excluir"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {vestibulares.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="text.secondary">
            Nenhum vestibular cadastrado
          </Typography>
        </Box>
      )}
    </Box>
  );
}
