import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import type { ChipProps } from "@mui/material";
import { PagamentosService } from "../../../services/pagamentos.service";
import type { IPagamento, PagamentoStatus } from "../../../types/pagamento";
import { useToast } from "../../../store/useToast";
import { useErrorHandler } from "../../../hooks/useErrorHandler";

const brl = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const statusColor = (status: PagamentoStatus): ChipProps["color"] => {
  if (status === "pago") return "success";
  if (status === "pendente") return "warning";
  if (status === "expirado") return "default";
  return "error";
};

export function ListaPagamentos() {
  const [pagamentos, setPagamentos] = useState<IPagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();

  const carregar = useCallback(async () => {
    try {
      setPagamentos(await PagamentosService.listarTodos());
    } catch (error) {
      handleError(error, "Erro ao carregar os pagamentos.");
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const confirmar = async (id: string) => {
    setConfirmando(id);
    try {
      await PagamentosService.confirmar(id);
      showToast("Pagamento confirmado e plano liberado.", "success");
      await carregar();
    } catch (error) {
      handleError(error, "Erro ao confirmar o pagamento.");
    } finally {
      setConfirmando(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Pagamentos
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Confirme manualmente os pagamentos recebidos via PIX para liberar o plano
        do aluno.
      </Typography>

      <TableContainer component={Paper} elevation={0} className="glass-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Aluno</TableCell>
              <TableCell>Plano</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Referência</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagamentos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  Nenhum pagamento registrado ainda.
                </TableCell>
              </TableRow>
            ) : (
              pagamentos.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>
                    {p.usuario?.name ?? "—"}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {p.usuario?.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{p.plano}</TableCell>
                  <TableCell>{brl(p.valor)}</TableCell>
                  <TableCell>{p.referencia}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={p.status}
                      color={statusColor(p.status)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {p.status === "pendente" ? (
                      <Button
                        size="small"
                        variant="contained"
                        disabled={confirmando === p._id}
                        onClick={() => confirmar(p._id)}
                      >
                        {confirmando === p._id ? "Confirmando..." : "Confirmar"}
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
