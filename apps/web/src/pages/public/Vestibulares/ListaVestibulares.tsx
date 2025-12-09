import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import {
  VestibularesService,
  type IVestibular,
} from "../../../services/vestibulares.service";
import SchoolIcon from "@mui/icons-material/School";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export function ListaVestibulares() {
  const [vestibulares, setVestibulares] = useState<IVestibular[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadVestibulares();
  }, []);

  const loadVestibulares = async () => {
    try {
      const data = await VestibularesService.list();
      setVestibulares(data);
    } catch (error) {
      console.error("Erro ao carregar vestibulares:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "aberto":
        return "success";
      case "encerrado":
        return "error";
      case "em_breve":
        return "warning";
      default:
        return "default";
    }
  };

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Vestibulares Disponíveis
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Explore informações sobre os principais vestibulares e processos
        seletivos
      </Typography>

      <Grid container spacing={3}>
        {vestibulares.map((vestibular) => (
          <Grid item xs={12} sm={6} md={4} key={vestibular._id}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <SchoolIcon color="primary" />
                  <Typography variant="h6">{vestibular.nome}</Typography>
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {vestibular.nomeCompleto}
                </Typography>

                {vestibular.proximaProva && (
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={vestibular.proximaProva.inscricoes.status.toUpperCase()}
                      color={getStatusColor(
                        vestibular.proximaProva.inscricoes.status
                      )}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" display="block">
                      Prova:{" "}
                      {new Date(
                        vestibular.proximaProva.data
                      ).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Taxa: R$ {vestibular.proximaProva.taxa.toFixed(2)}
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(`/vestibulares/${vestibular.codigo}`)}
                >
                  Ver Detalhes
                </Button>
                <Button
                  size="small"
                  href={vestibular.siteOficial}
                  target="_blank"
                  endIcon={<OpenInNewIcon />}
                >
                  Site Oficial
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
