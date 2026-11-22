import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
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

/**
 * Data/hora em America/Sao_Paulo. O admin casa o comprovante que chega no
 * WhatsApp com a linha da tabela pelo horário, então sempre com hora — nunca
 * só a data.
 */
const dataHora = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d
    .toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(", ", " ");
};

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
  /**
   * "pendentes" é a fila real de conferência do PIX manual: com o histórico
   * inteiro a tela virava 70+ linhas para achar quem está aguardando
   * comprovante agora.
   */
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "pendente">(
    "todos",
  );
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();

  const carregar = useCallback(async () => {
    try {
      const lista = await PagamentosService.listarTodos();
      // Mais recente primeiro: a API já ordena, mas o horário é o critério de
      // conferência do comprovante — não deixar depender da ordem de chegada.
      setPagamentos(
        [...lista].sort(
          (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
        )
      );
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

  const visiveis =
    filtroStatus === "pendente"
      ? pagamentos.filter((p) => p.status === "pendente")
      : pagamentos;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Pagamentos
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Confirme à mão apenas o PIX recebido na chave manual. Cobranças do
        Mercado Pago/PagBank são liberadas pelo webhook — se aparecer recusa, o
        motivo fica na coluna Status.
      </Typography>

      <ToggleButtonGroup
        size="small"
        exclusive
        value={filtroStatus}
        onChange={(_e, valor) => valor && setFiltroStatus(valor)}
        sx={{ mb: 2 }}
        aria-label="Filtrar pagamentos por status"
      >
        <ToggleButton value="todos">
          Todos ({pagamentos.length})
        </ToggleButton>
        <ToggleButton value="pendente">
          Somente pendentes (
          {pagamentos.filter((p) => p.status === "pendente").length})
        </ToggleButton>
      </ToggleButtonGroup>

      <TableContainer component={Paper} elevation={0} className="glass-container">
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell>Aluno</TableCell>
              <TableCell>Plano</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Referência</TableCell>
              <TableCell sx={{ px: 1 }}>Criado em</TableCell>
              <TableCell sx={{ px: 1 }}>Confirmado em</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right" sx={{ px: 1 }}>Ação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visiveis.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  {filtroStatus === "pendente"
                    ? "Nenhum pagamento aguardando comprovante."
                    : "Nenhum pagamento registrado ainda."}
                </TableCell>
              </TableRow>
            ) : (
              visiveis.map((p) => (
                <TableRow key={p._id}>
                  <TableCell sx={{ maxWidth: 190 }}>
                    {p.usuario?.name ?? "—"}
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                      noWrap
                    >
                      {p.usuario?.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{p.plano}</TableCell>
                  <TableCell>{brl(p.valor)}</TableCell>
                  <TableCell>{p.referencia}</TableCell>
                  <TableCell sx={{ px: 1, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {dataHora(p.criadoEm)}
                  </TableCell>
                  <TableCell sx={{ px: 1, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {dataHora(p.confirmadoEm || p.pagoEm)}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 170 }}>
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
                            maxWidth: 135,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.gateway === "manual"
                            ? "Aguardando comprovante"
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
