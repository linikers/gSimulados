import { useEffect, useState, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Table } from "../../../components/ui/Table";
import { Button } from "../../../components/ui/Button";
import { AlunosService } from "../../../services/alunos.service";
import type { IAluno } from "@gsimulados/shared";
import AddIcon from "@mui/icons-material/Add";
import { useToast } from "../../../store/useToast";
import { useAuth } from "../../../hooks/useAuth";

export function ListaAlunos() {
  const [alunos, setAlunos] = useState<IAluno[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const loadAlunos = useCallback(async () => {
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

  const columns = [
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
        <Button size="small" onClick={() => alert(`Editar ${row.name}`)}>
          Editar
        </Button>
      ),
    },
  ];

  const getRegisterPath = () => {
    if (user?.role === "admin") return "/admin/alunos/cadastro";
    // For school, we might want a specific route or reuse the admin one if permissions allow
    return "/admin/alunos/cadastro"; // Simplified for now since we only have one create form
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
    </Box>
  );
}
