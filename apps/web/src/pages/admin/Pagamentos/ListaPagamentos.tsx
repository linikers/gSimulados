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
  Tooltip,
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

const gatewayLabel = (gateway?: IPagamento["gateway"]) => {
  if (gateway === "mercadopago") return "Mercado Pago";
  if (gateway === "pagbank") return "PagBank";
  return "PIX manual";
};

/** Só PIX manual (ou registro antigo sem gateway) pode ser confirmado à mão. */
const podeConfirmar = (p: IPagamento) =>
  p.status === "pendente" && (!p.gateway || p.gateway === "manual");

/**
 * Pendência criada pelo gateway (não é PIX manual): o dinheiro não entrou e o
 * admin não deve confirmar. O fallback manual grava `motivoFalha`, mas o
 * pagamento em si é PIX manual e continua confirmável.
 */
const recusadoPeloGateway = (p: IPagamento) =>
  p.status === "pendente" &&
  !!p.gateway &&
  p.gateway !== "manual" &&
  !!(p.statusDetalhe || p.motivoFalha);

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
        Confirme à mão apenas o PIX recebido na chave manual. Cobranças do
        Mercado Pago/PagBank são liberadas pelo webhook — se aparecer recusa, o
        motivo fica na coluna Status.
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
                      label={recusadoPeloGateway(p) ? "recusado" : p.status}
                      color={
                        recusadoPeloGateway(p)
                          ? "error"
                          : statusColor(p.status)
                      }
                    />
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      {gatewayLabel(p.gateway)}
                    </Typography>
                    {(p.statusDetalhe || p.motivoFalha) && (
                      <Tooltip
                        title={p.motivoFalha || p.statusDetalhe || ""}
                        placement="top"
                      >
                        <Typography
                          variant="caption"
                          display="block"
                          color={
                            p.gateway === "manual" ? "text.secondary" : "error"
                          }
                          sx={{
                            maxWidth: 220,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.gateway === "manual"
                            ? `MP recusou: ${p.statusDetalhe || "falha"}`
                            : p.statusDetalhe || "falha"}
                        </Typography>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {podeConfirmar(p) ? (
                      <Button
                        size="small"
                        variant="contained"
                        disabled={confirmando === p._id}
                        onClick={() => confirmar(p._id)}
                      >
                        {confirmando === p._id ? "Confirmando..." : "Confirmar"}
                      </Button>
                    ) : (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        title={
                          p.status === "pendente"
                            ? "Cobrança automática — confirme no gateway"
                            : undefined
                        }
                      >
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
