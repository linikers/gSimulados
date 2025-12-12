import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import ListAltIcon from "@mui/icons-material/ListAlt";

interface RecursoCardProps {
  tipo: "provas" | "informacoes" | "notas_corte" | "concorrencia" | "listas";
  titulo: string;
  descricao: string;
  googleDriveUrl: string;
}

const iconMap = {
  provas: DescriptionIcon,
  informacoes: FolderIcon,
  notas_corte: TrendingUpIcon,
  concorrencia: PeopleIcon,
  listas: ListAltIcon,
};

const colorMap = {
  provas: "primary.main",
  informacoes: "info.main",
  notas_corte: "success.main",
  concorrencia: "warning.main",
  listas: "secondary.main",
};

export function RecursoCard({
  tipo,
  titulo,
  descricao,
  googleDriveUrl,
}: RecursoCardProps) {
  const Icon = iconMap[tipo];
  const color = colorMap[tipo];

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Icon sx={{ fontSize: 40, mr: 2, color }} />
          <Typography variant="h6" component="h3" fontWeight="bold">
            {titulo}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary">
          {descricao}
        </Typography>
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          variant="outlined"
          fullWidth
          href={googleDriveUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Acessar no Drive
        </Button>
      </Box>
    </Card>
  );
}
