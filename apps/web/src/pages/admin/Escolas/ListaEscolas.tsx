import { useEffect, useState, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Table } from "../../../components/ui/Table";
import { Button } from "../../../components/ui/Button";
import { EscolasService } from "../../../services/escolas.service";
import type { IEscola } from "@gsimulados/shared";
import AddIcon from "@mui/icons-material/Add";
import { useToast } from "../../../store/useToast";

export function ListaEscolas() {
  const [escolas, setEscolas] = useState<IEscola[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const loadEscolas = useCallback(async () => {
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

  const columns = [
    { id: "name", label: "Nome", minWidth: 170 },
    { id: "email", label: "Email", minWidth: 170 },
    { id: "nomeEscola", label: "Escola", minWidth: 170 },
    {
      id: "actions",
      label: "Ações",
      minWidth: 100,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      format: (_: any, row: IEscola) => (
        <Button size="small" onClick={() => alert(`Editar ${row.name}`)}>
          Editar
        </Button>
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
    </Box>
  );
}
