import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "../../components/public/Navbar";
import api from "../../services/api";
import { useToast } from "../../store/useToast";
import { useErrorHandler } from "../../hooks/useErrorHandler";

export function RedefinirSenha() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (senha.length < 8) {
      setErro("A senha precisa ter ao menos 8 caracteres.");
      return;
    }
    if (senha !== confirmacao) {
      setErro("As duas senhas não são iguais.");
      return;
    }

    setCarregando(true);
    try {
      await api.post("/auth/redefinir-senha", { token, password: senha });
      showToast("Senha alterada. Entre com a nova senha.", "success");
      navigate("/login", { replace: true });
    } catch (error) {
      handleError(error, "Não foi possível alterar a senha.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="xs" sx={{ py: { xs: 6, md: 12 } }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" fontWeight={700} gutterBottom>
            Criar nova senha
          </Typography>

          {!token ? (
            <Alert severity="error">
              Link sem token. Peça um novo em{" "}
              <Link to="/esqueci-senha">Esqueci minha senha</Link>.
            </Alert>
          ) : (
            <Box component="form" onSubmit={salvar}>
              {erro && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {erro}
                </Alert>
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                type="password"
                label="Nova senha"
                autoFocus
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                helperText="Mínimo de 8 caracteres"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                type="password"
                label="Repita a nova senha"
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={carregando}
                sx={{ mt: 3, mb: 2 }}
              >
                {carregando ? "Salvando..." : "Salvar nova senha"}
              </Button>
            </Box>
          )}

          <Link to="/login">Voltar para o login</Link>
        </Paper>
      </Container>
    </>
  );
}
