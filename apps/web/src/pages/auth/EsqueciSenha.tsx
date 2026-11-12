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
import { Link } from "react-router-dom";
import { Navbar } from "../../components/public/Navbar";
import api from "../../services/api";
import { useErrorHandler } from "../../hooks/useErrorHandler";

export function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const { handleError } = useErrorHandler();

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    try {
      await api.post("/auth/esqueci-senha", { email });
      setEnviado(true);
    } catch (error) {
      handleError(error, "Não foi possível enviar o link agora.");
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
            Esqueci minha senha
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Informe o e-mail da sua conta. Enviaremos um link válido por 1 hora.
          </Typography>

          {enviado ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Se este e-mail estiver cadastrado, o link de redefinição chegará em
              instantes. Confira também a caixa de spam.
            </Alert>
          ) : (
            <Box component="form" onSubmit={enviar}>
              <TextField
                margin="normal"
                required
                fullWidth
                type="email"
                label="E-mail"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={carregando}
                sx={{ mt: 3, mb: 2 }}
              >
                {carregando ? "Enviando..." : "Enviar link"}
              </Button>
            </Box>
          )}

          <Link to="/login">Voltar para o login</Link>
        </Paper>
      </Container>
    </>
  );
}
