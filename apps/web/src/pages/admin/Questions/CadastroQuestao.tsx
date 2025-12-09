import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  MenuItem,
  Divider,
} from "@mui/material";
import { useToast } from "../../../store/useToast";
import {
  QuestionsService,
  IQuestionForm,
} from "../../../services/questions.service";
import SaveIcon from "@mui/icons-material/Save";

export function CadastroQuestao() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<IQuestionForm>({
    enunciado: "",
    alternativas: ["", "", "", "", ""],
    respostaCorreta: "A",
    materia: "",
    assunto: "",
    dificuldade: "medio",
    origem: {
      vestibular: "",
      ano: new Date().getFullYear(),
    },
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOrigemChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      origem: { ...prev.origem, [field]: value },
    }));
  };

  const handleAlternativeChange = (index: number, value: string) => {
    const newAlternatives = [...formData.alternativas];
    newAlternatives[index] = value;
    setFormData((prev) => ({ ...prev, alternativas: newAlternatives }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await QuestionsService.create(formData);
      showToast("Questão cadastrada com sucesso!", "success");
      // Reset form
      setFormData({
        enunciado: "",
        alternativas: ["", "", "", "", ""],
        respostaCorreta: "A",
        materia: "",
        assunto: "",
        dificuldade: "medio",
        origem: {
          vestibular: "",
          ano: new Date().getFullYear(),
        },
      });
    } catch (error) {
      showToast("Erro ao cadastrar questão", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 800, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Cadastro de Questão
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Metadados */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Matéria (ex: Matemática)"
              value={formData.materia}
              onChange={(e) => handleChange("materia", e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Assunto (ex: Geometria)"
              value={formData.assunto}
              onChange={(e) => handleChange("assunto", e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Dificuldade"
              value={formData.dificuldade}
              onChange={(e) => handleChange("dificuldade", e.target.value)}
            >
              <MenuItem value="facil">Fácil</MenuItem>
              <MenuItem value="medio">Médio</MenuItem>
              <MenuItem value="dificil">Difícil</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Vestibular (ex: UEM)"
              value={formData.origem.vestibular}
              onChange={(e) => handleOrigemChange("vestibular", e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              label="Ano"
              value={formData.origem.ano}
              onChange={(e) =>
                handleOrigemChange("ano", Number(e.target.value))
              }
              required
            />
          </Grid>

          {/* Enunciado */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Enunciado da Questão"
              value={formData.enunciado}
              onChange={(e) => handleChange("enunciado", e.target.value)}
              required
              helperText="Você pode usar Markdown básico aqui."
            />
          </Grid>

          {/* Alternativas */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Alternativas
            </Typography>
            {formData.alternativas.map((alt, index) => (
              <Box
                key={index}
                sx={{ display: "flex", mb: 2, alignItems: "center" }}
              >
                <Typography sx={{ width: 30, fontWeight: "bold" }}>
                  {String.fromCharCode(65 + index)}
                </Typography>
                <TextField
                  fullWidth
                  value={alt}
                  onChange={(e) =>
                    handleAlternativeChange(index, e.target.value)
                  }
                  placeholder={`Opção ${String.fromCharCode(65 + index)}`}
                  required
                />
              </Box>
            ))}
          </Grid>

          {/* Resposta Correta */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Resposta Correta"
              value={formData.respostaCorreta}
              onChange={(e) => handleChange("respostaCorreta", e.target.value)}
              required
              sx={{ bgcolor: "#e8f5e9" }}
            >
              {["A", "B", "C", "D", "E"].map((opt) => (
                <MenuItem key={opt} value={opt}>
                  Alternativa {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              disabled={loading}
              fullWidth
            >
              {loading ? "Salvando..." : "Salvar Questão"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}
