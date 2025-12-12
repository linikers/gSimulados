import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";

interface VestibularCardProps {
  codigo: string;
  nome: string;
  nomeCompleto: string;
  cidade: string;
  estado: string;
  proximaData?: string;
  logoUrl?: string;
}

export function VestibularCard({
  codigo,
  nome,
  nomeCompleto,
  cidade,
  estado,
  proximaData,
  logoUrl,
}: VestibularCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={nome}
              style={{ width: 60, height: 60, marginRight: 16 }}
            />
          ) : (
            <SchoolIcon sx={{ fontSize: 60, mr: 2, color: "primary.main" }} />
          )}
          <Box>
            <Typography variant="h5" component="h2" fontWeight="bold">
              {nome}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {cidade} - {estado}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {nomeCompleto}
        </Typography>

        {proximaData && (
          <Typography variant="body2" color="primary" fontWeight="medium">
            Próxima prova: {new Date(proximaData).toLocaleDateString("pt-BR")}
          </Typography>
        )}
      </CardContent>

      <CardActions>
        <Button
          size="small"
          variant="contained"
          fullWidth
          onClick={() => navigate(`/vestibulares/${codigo}`)}
        >
          Ver Detalhes
        </Button>
      </CardActions>
    </Card>
  );
}
