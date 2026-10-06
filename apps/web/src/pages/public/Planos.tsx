import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Grid,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import { PagamentosService } from "../../services/pagamentos.service";
import type { IPlano, ICheckoutResponse } from "../../types/pagamento";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../store/useToast";
import { useErrorHandler } from "../../hooks/useErrorHandler";

const brl = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function Planos() {
  const [planos, setPlanos] = useState<IPlano[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState<ICheckoutResponse | null>(null);
  const [processando, setProcessando] = useState<string | null>(null);
  const { signed } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    PagamentosService.listarPlanos()
      .then(setPlanos)
      .catch((e) => handleError(e, "Erro ao carregar os planos."))
      .finally(() => setLoading(false));
  }, [handleError]);

  const handleAssinar = async (plano: IPlano) => {
    if (!signed) {
      navigate("/login");
      return;
    }
    setProcessando(plano.codigo);
    try {
      const data = await PagamentosService.checkout(plano.codigo);
      setCheckout(data);
    } catch (error) {
      handleError(error, "Não foi possível iniciar o pagamento.");
    } finally {
      setProcessando(null);
    }
  };

  const copiar = (texto: string) => {
    navigator.clipboard?.writeText(texto);
    showToast("Copiado!", "success");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
          Planos
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Escolha o plano ideal e libere os simulados por IA.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {planos.map((plano) => {
          const gratuito = plano.preco <= 0;
          return (
            <Grid key={plano.codigo} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                className="glass-container"
                sx={{
                  p: 4,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {plano.nome}
                  </Typography>
                  <Chip
                    size="small"
                    label={plano.publico === "escola" ? "Escola" : "Aluno"}
                    color={plano.publico === "escola" ? "secondary" : "primary"}
                  />
                </Box>

                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
                  {gratuito ? "Grátis" : brl(plano.preco)}
                  {!gratuito && (
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {" "}
                      /mês
                    </Typography>
                  )}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {plano.descricao}
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Button
                  fullWidth
                  variant={gratuito ? "outlined" : "contained"}
                  disabled={processando === plano.codigo}
                  onClick={() => handleAssinar(plano)}
                  sx={{ borderRadius: "12px", py: 1.5 }}
                >
                  {gratuito
                    ? "Começar grátis"
                    : processando === plano.codigo
                      ? "Gerando PIX..."
                      : "Assinar com PIX"}
                </Button>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Dialog
        open={!!checkout}
        onClose={() => setCheckout(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Pagamento via PIX
        </DialogTitle>
        <DialogContent>
          {checkout && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Alert severity="info">
                Pague o valor abaixo pelo PIX e envie o comprovante. A liberação
                do plano é feita manualmente após a confirmação.
              </Alert>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Valor
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {brl(checkout.pagamento.valor)}
                </Typography>
              </Box>

              <Divider />

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Chave PIX
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {checkout.pix.chave}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {checkout.pix.nomeBeneficiario}
                    {checkout.pix.cidade ? ` · ${checkout.pix.cidade}` : ""}
                  </Typography>
                </Box>
                <Tooltip title="Copiar chave">
                  <IconButton onClick={() => copiar(checkout.pix.chave)}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Divider />

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Referência (informe no comprovante)
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>
                    {checkout.pagamento.referencia}
                  </Typography>
                </Box>
                <Tooltip title="Copiar referência">
                  <IconButton
                    onClick={() => copiar(checkout.pagamento.referencia)}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {checkout.pix.instrucoes && (
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  {checkout.pix.instrucoes}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckout(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
