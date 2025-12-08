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

import type { ICadastroAlunoDTO } from "@gsimulados/shared";

export function CadastroAluno() {
  const [formData, setFormData] = useState<ICadastroAlunoDTO>({
    name: "",
    email: "",
    password: "",
    matricula: "",
    escolaId: "", // Optional, for admin use
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await api.post("/alunos", formData);
      setMessage({ type: "success", text: "Aluno cadastrado com sucesso!" });
      setFormData({
        name: "",
        email: "",
        password: "",
        matricula: "",
        escolaId: "",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Erro ao cadastrar aluno";
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
          Cadastrar Novo Aluno
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
            label="Nome do Aluno"
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
            label="Matrícula"
            name="matricula"
            value={formData.matricula}
            onChange={handleChange}
          />

          {/* TODO: Add Select for Escola if Admin */}

          <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
            Cadastrar Aluno
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
