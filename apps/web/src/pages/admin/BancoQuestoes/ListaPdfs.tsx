import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  //   Button,
  Chip,
  IconButton,
  MenuItem,
  TextField,
  Stack,
} from "@mui/material";
import { useToast } from "../../../store/useToast";
import {
  PdfExtractionService,
  type IPdfSource,
} from "../../../services/pdf-extraction.service";
import {
  VestibularesService,
  type IVestibular,
} from "../../../services/vestibulares.service";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DescriptionIcon from "@mui/icons-material/Description";

export function ListaPdfs() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pdfs, setPdfs] = useState<IPdfSource[]>([]);
  const [vestibulares, setVestibulares] = useState<IVestibular[]>([]);
  const [filterVestibular, setFilterVestibular] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    loadData();
  }, [filterVestibular, filterStatus]);

  const loadData = async () => {
    try {
      const [pdfsData, vestibs] = await Promise.all([
        PdfExtractionService.listPdfs(filterVestibular, filterStatus),
        VestibularesService.list(),
      ]);
      setPdfs(pdfsData);
      setVestibulares(vestibs);
    } catch (error) {
      showToast(`Erro ao carregar PDFs: ${error}`);
    }
  };

  const handleExtract = async (id: string, fileName: string) => {
    if (!window.confirm(`Extrair questões de ${fileName}?`)) return;

    try {
      setLoading(true);
      const result = await PdfExtractionService.extractFromPdf(id);
      showToast(`${result.message}`, "success");
      loadData();
    } catch (error) {
      showToast(`Erro ao extrair: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "processing":
        return "info";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "processing":
        return "Processando";
      case "completed":
        return "Concluído";
      case "error":
        return "Erro";
      default:
        return status;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        PDFs Disponíveis
      </Typography>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            select
            label="Vestibular"
            value={filterVestibular}
            onChange={(e) => setFilterVestibular(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {vestibulares.map((v) => (
              <MenuItem key={v.codigo} value={v.codigo}>
                {v.nome}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pending">Pendente</MenuItem>
            <MenuItem value="processing">Processando</MenuItem>
            <MenuItem value="completed">Concluído</MenuItem>
            <MenuItem value="error">Erro</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {/* Tabela */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Arquivo</TableCell>
              <TableCell>Vestibular</TableCell>
              <TableCell>Tamanho</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Questões</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pdfs.map((pdf) => (
              <TableRow key={pdf._id}>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DescriptionIcon color="action" />
                    <Typography variant="body2">{pdf.fileName}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={pdf.vestibularCodigo.toUpperCase()}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatFileSize(pdf.fileSize)}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(pdf.status)}
                    color={getStatusColor(pdf.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {pdf.questoesExtraidas > 0 ? (
                    <Chip
                      label={pdf.questoesExtraidas}
                      color="primary"
                      size="small"
                    />
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    href={pdf.webViewLink}
                    target="_blank"
                    title="Abrir no Drive"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                  {pdf.status === "pending" && (
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleExtract(pdf._id, pdf.fileName)}
                      disabled={loading}
                      title="Extrair Questões"
                    >
                      <PlayArrowIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {pdfs.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center", mt: 2 }}>
          <Typography color="text.secondary">
            Nenhum PDF encontrado. Configure uma pasta do Google Drive primeiro.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
