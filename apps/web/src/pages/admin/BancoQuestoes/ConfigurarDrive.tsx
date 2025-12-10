import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  Chip,
  IconButton,
  MenuItem,
} from "@mui/material";
import { useToast } from "../../../store/useToast";
import {
  DriveConfigService,
  type IDriveConfig,
} from "../../../services/drive-config.service";
import {
  VestibularesService,
  type IVestibular,
} from "../../../services/vestibulares.service";
import SaveIcon from "@mui/icons-material/Save";
import SyncIcon from "@mui/icons-material/Sync";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderIcon from "@mui/icons-material/Folder";

export function ConfigurarDrive() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [vestibulares, setVestibulares] = useState<IVestibular[]>([]);
  const [configs, setConfigs] = useState<IDriveConfig[]>([]);
  const [formData, setFormData] = useState({
    vestibularCodigo: "",
    googleDriveFolderId: "",
    folderName: "",
    folderUrl: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [vestibs, confs] = await Promise.all([
        VestibularesService.list(),
        DriveConfigService.list(),
      ]);
      setVestibulares(vestibs);
      setConfigs(confs);
    } catch (error) {
      showToast(`Erro ao carregar dados: ${error}`);
    }
  }, [showToast]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await DriveConfigService.upsert(formData);
      showToast("Configuração salva com sucesso!", "success");
      setFormData({
        vestibularCodigo: "",
        googleDriveFolderId: "",
        folderName: "",
        folderUrl: "",
      });
      loadData();
    } catch (error) {
      showToast(`Erro ao salvar: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (codigo: string) => {
    try {
      setLoading(true);
      const result = await DriveConfigService.syncPdfs(codigo);
      showToast(
        `Sincronização concluída! ${result.created} PDFs novos, ${result.total} total`,
        "success"
      );
      loadData();
    } catch (error) {
      showToast(`Erro ao sincronizar: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (codigo: string) => {
    if (!window.confirm("Deseja realmente remover esta configuração?")) return;

    try {
      await DriveConfigService.delete(codigo);
      showToast("Configuração removida", "success");
      loadData();
    } catch (error) {
      showToast(`Erro ao remover: ${error}`);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Configurar Google Drive
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Configure as pastas do Google Drive onde estão os PDFs das provas
      </Typography>

      {/* Formulário */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Nova Configuração
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              select
              fullWidth
              label="Vestibular"
              value={formData.vestibularCodigo}
              onChange={(e) => handleChange("vestibularCodigo", e.target.value)}
              required
            >
              {vestibulares.map((v) => (
                <MenuItem key={v.codigo} value={v.codigo}>
                  {v.nome} - {v.nomeCompleto}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="URL da Pasta do Drive"
              value={formData.folderUrl}
              onChange={(e) => handleChange("folderUrl", e.target.value)}
              required
              placeholder="https://drive.google.com/drive/folders/..."
              helperText="Cole a URL completa da pasta do Google Drive"
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="ID da Pasta"
                value={formData.googleDriveFolderId}
                onChange={(e) =>
                  handleChange("googleDriveFolderId", e.target.value)
                }
                required
                helperText="Extraído automaticamente da URL"
              />
              <TextField
                fullWidth
                label="Nome da Pasta"
                value={formData.folderName}
                onChange={(e) => handleChange("folderName", e.target.value)}
                required
              />
            </Stack>

            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
              fullWidth
            >
              {loading ? "Salvando..." : "Salvar Configuração"}
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Configurações Existentes */}
      <Typography variant="h6" gutterBottom>
        Pastas Configuradas ({configs.length})
      </Typography>

      <Stack spacing={2}>
        {configs.map((config) => (
          <Card key={config._id}>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <FolderIcon color="primary" />
                  <Box>
                    <Typography variant="h6">
                      {config.vestibularCodigo.toUpperCase()} -{" "}
                      {config.folderName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {config.totalPdfs} PDFs • {config.totalQuestoesExtraidas}{" "}
                      questões extraídas
                    </Typography>
                    {config.lastSync && (
                      <Typography variant="caption" color="text.secondary">
                        Última sincronização:{" "}
                        {new Date(config.lastSync).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Chip
                    label={config.ativo ? "Ativo" : "Inativo"}
                    color={config.ativo ? "success" : "default"}
                    size="small"
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleSync(config.vestibularCodigo)}
                    title="Sincronizar PDFs"
                  >
                    <SyncIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(config.vestibularCodigo)}
                    title="Remover"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}

        {configs.length === 0 && (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              Nenhuma pasta configurada ainda
            </Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}
