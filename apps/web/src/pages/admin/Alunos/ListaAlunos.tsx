import { useEffect, useState, useCallback } from "react";
import { Box, Typography, Avatar, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Table } from "../../../components/ui/Table";
import { Button } from "../../../components/ui/Button";
import { AlunosService } from "../../../services/alunos.service";
import type { IAluno } from "@gsimulados/shared";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useToast } from "../../../store/useToast";
import { useAuth } from "../../../hooks/useAuth";
import { EditAlunoDialog } from "./EditAlunoDialog";

export function ListaAlunos() {
  const [alunos, setAlunos] = useState<IAluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAluno, setSelectedAluno] = useState<IAluno | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const loadAlunos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AlunosService.list();
      setAlunos(data);
    } catch {
      showToast("Erro ao carregar alunos", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAlunos();
  }, [loadAlunos]);

  const handleEdit = (aluno: IAluno) => {
    setSelectedAluno(aluno);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (data: Partial<IAluno>) => {
    if (!selectedAluno?._id) return;
    try {
      await AlunosService.update(selectedAluno._id, data);
      showToast("Aluno atualizado com sucesso!", "success");
      loadAlunos();
    } catch {
      showToast("Erro ao atualizar aluno.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este aluno?")) return;
    try {
      await AlunosService.delete(id);
      showToast("Aluno excluído com sucesso!", "success");
      loadAlunos();
    } catch {
      showToast("Erro ao excluir aluno.", "error");
    }
  };

  const columns = [
    {
      id: "avatar",
      label: "",
      minWidth: 50,
      format: (_: any, row: IAluno) => (
        <Avatar src={row.avatar} sx={{ width: 32, height: 32 }}>
          {row.name?.[0]}
        </Avatar>
      ),
    },
    { id: "name", label: "Nome", minWidth: 170 },
    { id: "email", label: "Email", minWidth: 170 },
    // Only show "Escola" column if user is Admin
    ...(user?.role === "admin"
      ? [
          {
            id: "escolaId",
            label: "Escola",
            minWidth: 170,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            format: (value: any) => value?.name || "N/A",
          },
        ]
      : []),
    {
      id: "actions",
      label: "Ações",
      minWidth: 100,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      format: (_: any, row: IAluno) => (
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
            onClick={() => handleDelete(row._id!)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const getRegisterPath = () => {
    if (user?.role === "admin") return "/admin/alunos/cadastro";
    return "/admin/alunos/cadastro";
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4">Alunos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(getRegisterPath())}
        >
          Novo Aluno
        </Button>
      </Box>

      <Table
        columns={columns}
        rows={alunos}
        loading={loading}
        rowsPerPageOptions={[5, 10, 25]}
      />

      <EditAlunoDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSave}
        aluno={selectedAluno}
      />
    </Box>
  );
}
