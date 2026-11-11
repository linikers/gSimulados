import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Link as MuiLink,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { GatewaysService } from "../../services/gateways.service";
import type { Gateway, IGatewayStatus } from "../../services/gateways.service";
import { useToast } from "../../store/useToast";
import { useErrorHandler } from "../../hooks/useErrorHandler";

const origemInfo: Record<
  IGatewayStatus["origem"],
  { rotulo: string; color: "success" | "info" | "default" }
> = {
  painel: { rotulo: "Configurado no painel", color: "success" },
  ambiente: { rotulo: "Via ambiente (Fly)", color: "info" },
  nenhum: { rotulo: "Não configurado", color: "default" },
};

export function Gateways() {
  const [status, setStatus] = useState<IGatewayStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState<Gateway | null>(null);
  const [mpToken, setMpToken] = useState("");
  const [mpPublicKey, setMpPublicKey] = useState("");
  const [pbToken, setPbToken] = useState("");
  const [pbEmail, setPbEmail] = useState("");
  const [confirmarRemocao, setConfirmarRemocao] = useState<Gateway | null>(null);
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();

  const carregar = useCallback(async () => {
    try {
      setStatus(await GatewaysService.status());
    } catch (error) {
      handleError(error, "Erro ao carregar os gateways.");
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const salvar = async (gateway: Gateway, credenciais: Record<string, string>) => {
    setSalvando(gateway);
    try {
      await GatewaysService.salvar(gateway, credenciais);
      showToast("Credencial salva e já valendo no checkout.", "success");
      setMpToken("");
      setMpPublicKey("");
      setPbToken("");
      setPbEmail("");
      await carregar();
    } catch (error) {
      handleError(error, "Erro ao salvar a credencial.");
    } finally {
      setSalvando(null);
    }
  };

  const remover = async () => {
    const gateway = confirmarRemocao;
    if (!gateway) return;
    setConfirmarRemocao(null);
    setSalvando(gateway);
    try {
      await GatewaysService.remover(gateway);
      showToast("Credencial removida; voltou para a variável de ambiente.", "info");
      await carregar();
    } catch (error) {
      handleError(error, "Erro ao remover a credencial.");
    } finally {
      setSalvando(null);
    }
  };

  const doGateway = (gateway: Gateway) =>
    status.find((s) => s.gateway === gateway);

  const cardStatus = (gateway: Gateway) => {
    const atual = doGateway(gateway);
    if (!atual) return null;
    const info = origemInfo[atual.origem];
    return (
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", mt: 1 }}>
        <Chip size="small" label={info.rotulo} color={info.color} />
        {atual.tokenMascarado && (
          <Typography variant="caption" color="text.secondary">
            {atual.tokenMascarado}
          </Typography>
        )}
        {atual.atualizadoEm && (
          <Typography variant="caption" color="text.secondary">
            · alterado em {new Date(atual.atualizadoEm).toLocaleDateString("pt-BR")}
            {atual.atualizadoPor ? ` por ${atual.atualizadoPor}` : ""}
          </Typography>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress size={56} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
        Gateways de pagamento
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Troque a credencial pelo painel, sem redeploy. O token salvo nunca é
        exibido de volta — só os 4 últimos caracteres.
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        A credencial salva passa a valer <b>imediatamente</b> em todas as
        cobranças. <b>Remover</b> apaga a do painel e volta a usar a variável de
        ambiente do Fly — se ela não existir, o gateway fica desligado.
      </Alert>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Paper elevation={0} className="glass-container" sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Mercado Pago
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access Token de produção (Suas integrações → Credenciais).
                </Typography>
              </Box>
            </Box>
            {cardStatus("mercadopago")}
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 7 }}>
                <TextField
                  fullWidth
                  label="Access Token"
                  type="password"
                  placeholder="APP_USR-..."
                  value={mpToken}
                  onChange={(e) => setMpToken(e.target.value)}
                  helperText="Validado no Mercado Pago antes de salvar."
                />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  label="Public Key (opcional)"
                  value={mpPublicKey}
                  onChange={(e) => setMpPublicKey(e.target.value)}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Button
                variant="contained"
                disabled={!mpToken.trim() || salvando === "mercadopago"}
                onClick={() =>
                  salvar("mercadopago", {
                    accessToken: mpToken,
                    ...(mpPublicKey ? { publicKey: mpPublicKey } : {}),
                  })
                }
              >
                {salvando === "mercadopago" ? "Validando..." : "Salvar credenciais"}
              </Button>
              {doGateway("mercadopago")?.origem === "painel" && (
                <Button
                  variant="outlined"
                  color="error"
                  disabled={salvando === "mercadopago"}
                  onClick={() => setConfirmarRemocao("mercadopago")}
                >
                  Remover do painel
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper elevation={0} className="glass-container" sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              PagBank
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Token do Portal do Desenvolvedor (sandbox) ou de Vendas →
              Integrações (produção).
            </Typography>
            {cardStatus("pagbank")}
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 7 }}>
                <TextField
                  fullWidth
                  label="Token"
                  type="password"
                  value={pbToken}
                  onChange={(e) => setPbToken(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  label="E-mail da conta (opcional)"
                  value={pbEmail}
                  onChange={(e) => setPbEmail(e.target.value)}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Button
                variant="contained"
                disabled={!pbToken.trim() || salvando === "pagbank"}
                onClick={() =>
                  salvar("pagbank", {
                    token: pbToken,
                    ...(pbEmail ? { email: pbEmail } : {}),
                  })
                }
              >
                {salvando === "pagbank" ? "Salvando..." : "Salvar credenciais"}
              </Button>
              {doGateway("pagbank")?.origem === "painel" && (
                <Button
                  variant="outlined"
                  color="error"
                  disabled={salvando === "pagbank"}
                  onClick={() => setConfirmarRemocao("pagbank")}
                >
                  Remover do painel
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper elevation={0} className="glass-container" sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              PIX manual
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Chave, beneficiário e instruções usados quando o gateway recusa ou
              está desligado.
            </Typography>
            <MuiLink component={Link} to="/admin/pagamentos/pix" fontWeight={600}>
              Configurar PIX manual →
            </MuiLink>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={Boolean(confirmarRemocao)} onClose={() => setConfirmarRemocao(null)}>
        <DialogTitle>Remover credencial do painel?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            O checkout volta a usar a variável de ambiente do Fly para{" "}
            {confirmarRemocao === "mercadopago" ? "Mercado Pago" : "PagBank"}.
            Se ela não existir, o gateway fica desligado até você salvar outra.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmarRemocao(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={remover}>
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
