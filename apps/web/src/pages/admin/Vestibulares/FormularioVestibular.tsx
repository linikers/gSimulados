import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  MenuItem,
  Divider,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useToast } from "../../../store/useToast";
import {
  VestibularesService,
  type IVestibular,
} from "../../../services/vestibulares.service";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export function FormularioVestibular() {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    codigo: "",
    nome: "",
    nomeCompleto: "",
    descricao: "",
    siteOficial: "",
    cidade: "",
    estado: "",
    logoUrl: "",
    ativo: true,
    ordem: 0,
  });

  const isEdit = !!codigo;

  useEffect(() => {
    if (isEdit) {
      loadVestibular();
    }
  }, [codigo]);

  const loadVestibular = async () => {
    if (!codigo) return;
    try {
      const data = await VestibularesService.getByCode(codigo);
      setFormData({
        codigo: data.codigo,
        nome: data.nome,
        nomeCompleto: data.nomeCompleto,
        descricao: data.descricao,
        siteOficial: data.siteOficial,
        cidade: data.cidade || "",
        estado: data.estado || "",
        logoUrl: data.logoUrl || "",
        ativo: data.ativo,
        ordem: data.ordem,
      });
    } catch (error) {
      showToast("Erro ao carregar vestibular", "error");
      navigate("/admin/vestibulares");
    }
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await VestibularesService.update(codigo!, formData);
        showToast("Vestibular atualizado com sucesso!", "success");
      } else {
        await VestibularesService.create(formData);
        showToast("Vestibular cadastrado com sucesso!", "success");
      }
      navigate("/admin/vestibulares");
    } catch (error) {
      showToast(
        `Erro ao ${isEdit ? "atualizar" : "cadastrar"} vestibular`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/admin/vestibulares")}
        sx={{ mb: 2 }}
      >
        Voltar
      </Button>

      <Paper sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h5" gutterBottom>
          {isEdit ? "Editar Vestibular" : "Novo Vestibular"}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Código (somente na criação) */}
            <TextField
              fullWidth
              label="Código (ex: uem, enem)"
              value={formData.codigo}
              onChange={(e) =>
                handleChange("codigo", e.target.value.toLowerCase())
              }
              required
              disabled={isEdit}
              helperText={
                isEdit
                  ? "O código não pode ser alterado"
                  : "Use apenas letras minúsculas"
              }
            />

            {/* Nome e Nome Completo */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Nome Curto (ex: UEM)"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Nome Completo"
                value={formData.nomeCompleto}
                onChange={(e) => handleChange("nomeCompleto", e.target.value)}
                required
              />
            </Stack>

            {/* Descrição */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descrição"
              value={formData.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              required
            />

            {/* Site Oficial */}
            <TextField
              fullWidth
              label="Site Oficial"
              value={formData.siteOficial}
              onChange={(e) => handleChange("siteOficial", e.target.value)}
              required
              type="url"
              placeholder="https://..."
            />

            {/* Localização */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Cidade"
                value={formData.cidade}
                onChange={(e) => handleChange("cidade", e.target.value)}
              />
              <TextField
                fullWidth
                label="Estado (UF)"
                value={formData.estado}
                onChange={(e) =>
                  handleChange("estado", e.target.value.toUpperCase())
                }
                inputProps={{ maxLength: 2 }}
                placeholder="PR"
              />
            </Stack>

            {/* Logo URL */}
            <TextField
              fullWidth
              label="URL do Logo (opcional)"
              value={formData.logoUrl}
              onChange={(e) => handleChange("logoUrl", e.target.value)}
              type="url"
              placeholder="https://..."
            />

            {/* Ordem e Status */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
            >
              <TextField
                fullWidth
                type="number"
                label="Ordem de Exibição"
                value={formData.ordem}
                onChange={(e) => handleChange("ordem", Number(e.target.value))}
                helperText="Menor número aparece primeiro"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.ativo}
                    onChange={(e) => handleChange("ativo", e.target.checked)}
                  />
                }
                label="Ativo"
              />
            </Stack>

            {/* Botão Salvar */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              disabled={loading}
              fullWidth
            >
              {loading ? "Salvando..." : isEdit ? "Atualizar" : "Cadastrar"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
