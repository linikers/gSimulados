import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
} from "@mui/material";
import api from "../../../services/api";

export function CreateSchool() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    cnpj: "",
    endereco: "",
    telefone: "",
    logo: "",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await api.post("/schools", formData);
      setMessage({ type: "success", text: "Escola cadastrada com sucesso!" });
      setFormData({
        name: "",
        email: "",
        password: "",
        cnpj: "",
        endereco: "",
        telefone: "",
        logo: "",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || "Erro ao cadastrar escola";
      setMessage({ type: "error", text: errorMsg });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper
        elevation={3}
        sx={{ p: 4, display: "flex", flexDirection: "column" }}
      >
        <Typography component="h1" variant="h5" mb={3}>
          Cadastrar Nova Escola
        </Typography>

        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Nome da Escola"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Senha Inicial"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="CNPJ"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Endereço"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="URL do Logo"
            name="logo"
            helperText="Link para a imagem do logo"
            value={formData.logo}
            onChange={handleChange}
          />

          <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
            Cadastrar Escola
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
