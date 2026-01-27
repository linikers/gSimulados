import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../store/useToast";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "src/components/public/Navbar";

export function LoginPage() {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn({ email, password });
      navigate("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const msg = error.response?.data?.error || "Erro ao fazer login";
      showToast(msg, "error");
    }
  };

  return (
    <>
      <Navbar />
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            mt: 14,
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            Login
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Entrar
            </Button>
            <Link to="/register">Não tem conta? Cadastre-se</Link>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
