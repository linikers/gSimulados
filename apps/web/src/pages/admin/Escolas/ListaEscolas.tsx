import { useEffect, useState, useCallback } from "react";
import { Box, Typography, Avatar, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Table } from "../../../components/ui/Table";
import { Button } from "../../../components/ui/Button";
import { EscolasService } from "../../../services/escolas.service";
import type { IEscola } from "@gsimulados/shared";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useToast } from "../../../store/useToast";
import { EditEscolaDialog } from "./EditEscolaDialog";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";

export function ListaEscolas() {
  const [escolas, setEscolas] = useState<IEscola[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEscola, setSelectedEscola] = useState<IEscola | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IEscola | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const loadEscolas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await EscolasService.list();
      setEscolas(data);
    } catch {
      showToast("Erro ao carregar escolas", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadEscolas();
  }, [loadEscolas]);

  const handleEdit = (escola: IEscola) => {
    setSelectedEscola(escola);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (data: Partial<IEscola>) => {
    if (!selectedEscola?._id) return;
    try {
      await EscolasService.update(selectedEscola._id, data);
      showToast("Escola atualizada com sucesso!", "success");
      loadEscolas();
    } catch {
      showToast("Erro ao atualizar escola.", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?._id) return;
    try {
      await EscolasService.delete(deleteTarget._id);
      showToast("Escola excluída com sucesso!", "success");
      loadEscolas();
    } catch {
      showToast("Erro ao excluir escola.", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      id: "logo",
      label: "",
      minWidth: 50,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      format: (_: any, row: IEscola) => (
        <Avatar
          src={row.logo || row.avatar}
          sx={{ width: 32, height: 32 }}
          variant="rounded"
        >
          {row.nomeEscola?.[0] || row.name[0]}
        </Avatar>
      ),
    },
    { id: "nomeEscola", label: "Escola", minWidth: 170 },
    { id: "name", label: "Responsável", minWidth: 170 },
    { id: "email", label: "Email", minWidth: 170 },
    {
      id: "actions",
      label: "Ações",
      minWidth: 100,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      format: (_: any, row: IEscola) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleEdit(row)}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setDeleteTarget(row)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4">Escolas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/admin/escolas/cadastro")}
        >
          Nova Escola
        </Button>
      </Box>

      <Table
        columns={columns}
        rows={escolas}
        loading={loading}
        rowsPerPageOptions={[5, 10, 25]}
      />

      <EditEscolaDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSave}
        escola={selectedEscola}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir escola"
        message={`Tem certeza que deseja excluir "${deleteTarget?.nomeEscola || deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
