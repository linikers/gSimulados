import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
} from "@mui/material";
import { PagamentosService } from "../../../services/pagamentos.service";
import type { IPixConfig } from "../../../types/pagamento";
import { useToast } from "../../../store/useToast";
import { useErrorHandler } from "../../../hooks/useErrorHandler";

const vazio: IPixConfig = {
  chave: "",
  nomeBeneficiario: "",
  cidade: "",
  instrucoes: "",
  ativo: false,
};

export function ConfigurarPix() {
  const [config, setConfig] = useState<IPixConfig>(vazio);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    PagamentosService.getPixConfig()
      .then((data) => {
        if (data) setConfig({ ...vazio, ...data });
      })
      .catch((e) => handleError(e, "Erro ao carregar a configuração do PIX."))
      .finally(() => setLoading(false));
  }, [handleError]);

  const salvar = async () => {
    setSalvando(true);
    try {
      const salvo = await PagamentosService.salvarPixConfig(config);
      setConfig({ ...vazio, ...salvo });
      showToast("Configuração do PIX salva.", "success");
    } catch (error) {
      handleError(error, "Erro ao salvar a configuração do PIX.");
    } finally {
      setSalvando(false);
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
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Pagamento via PIX
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configuração manual do recebimento. O aluno envia o PIX para esta chave e
        o administrador confirma o pagamento.
      </Typography>

      <Paper elevation={0} className="glass-container" sx={{ p: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label="Chave PIX"
            value={config.chave}
            required
            fullWidth
            helperText="CPF/CNPJ, e-mail, telefone ou chave aleatória"
            onChange={(e) => setConfig({ ...config, chave: e.target.value })}
          />
          <TextField
            label="Nome do beneficiário"
            value={config.nomeBeneficiario}
            fullWidth
            onChange={(e) =>
              setConfig({ ...config, nomeBeneficiario: e.target.value })
            }
          />
          <TextField
            label="Cidade"
            value={config.cidade}
            fullWidth
            onChange={(e) => setConfig({ ...config, cidade: e.target.value })}
          />
          <TextField
            label="Instruções para o aluno"
            value={config.instrucoes}
            fullWidth
            multiline
            minRows={3}
            placeholder="Ex: Envie o comprovante para contato@gsimulados.com.br informando o código de referência."
            onChange={(e) =>
              setConfig({ ...config, instrucoes: e.target.value })
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={config.ativo}
                onChange={(e) =>
                  setConfig({ ...config, ativo: e.target.checked })
                }
              />
            }
            label="Ativar recebimento via PIX"
          />

          {!config.ativo && (
            <Alert severity="warning">
              Enquanto o PIX estiver desativado, o checkout fica indisponível
              para os alunos.
            </Alert>
          )}

          <Box>
            <Button
              variant="contained"
              onClick={salvar}
              disabled={salvando || !config.chave}
              sx={{ borderRadius: "12px", px: 4 }}
            >
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
